import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, FileCheck, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";
import api from "../../lib/axios-instance";
import * as XLSX from 'xlsx';
import { ACCESS_TOKEN_KEY } from "../../lib/constants";

const courseTypes = [
  "seminar",
  "independent_study",
  "teaching_practice_1",
  "practice_lecture_series_1",
  "thesis",
  "research_project_1",
  "research_project_2",
  "research_practice",
  "reading_course_2",
  "study_in_advanced_topics",
  "dissertations",
];

interface ProcessedRow {
  erpId: string;
  campusId: string;
  name?: string | null;
  courseType: string;
  instructor?: string | null;
  supervisor?: string | null;
  coSupervisor?: string | null;
  title?: string | null;
  topicOfResearchPractice?: string | null;
  topicOfResearchProject?: string | null;
  topicOfCourseWork?: string | null;
  midSemMarks?: number | null;
  midSemGrade?: string | null;
  endSemMarks?: number | null;
  endSemGrade?: string | null;
}

const UploadExcelForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [courseType, setCourseType] = useState<string>("");
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const processExcelFile = async (file: File): Promise<ProcessedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            reject(new Error("Excel file does not contain any sheets"));
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: null });
          
          // Find header row
          let headerRowIndex = -1;
          let headers: string[] = [];
          
          for (let i = 0; i < Math.min(20, rawData.length); i++) {
            const row = rawData[i];
            if (!row) continue;
            
            const rowStr = row.join(' ').toLowerCase();
            if (rowStr.includes('s.no') && (rowStr.includes('emplid') || rowStr.includes('empl id') || rowStr.includes('erp id')) && rowStr.includes('campus id')) {
              headers = row.map(cell => cell !== null && cell !== undefined ? String(cell) : '');
              headerRowIndex = i;
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            const commonHeaderRows = [7, 8, 9, 10, 11, 12, 13];
            for (const rowIndex of commonHeaderRows) {
              if (rowIndex >= rawData.length) continue;
              
              const row = rawData[rowIndex];
              if (!row) continue;
              
              const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '');
              if (nonEmptyCells.length >= 3) {
                const rowStr = row.join(' ').toLowerCase();
                if (rowStr.includes('name') || rowStr.includes('id') || rowStr.includes('marks')) {
                  headers = row.map(cell => cell !== null && cell !== undefined ? String(cell) : '');
                  headerRowIndex = rowIndex;
                  break;
                }
              }
            }
          }
          
          if (headerRowIndex === -1) {
            reject(new Error("Could not find header row in Excel file"));
            return;
          }
          
          const headerMap: Record<number, string> = {};
          
          headers.forEach((header, index) => {
            if (!header) return;
            
            const headerLower = header.toLowerCase();
            
            if (headerLower.includes('s.no') || headerLower === 'sno') {
              headerMap[index] = 'serialNo';
            } else if (headerLower.includes('empl id') || headerLower === 'emplid' || headerLower === 'erp id') {
              headerMap[index] = 'erpId';
            } else if (headerLower.includes('campus id')) {
              headerMap[index] = 'campusId';
            } else if (headerLower === 'name') {
              headerMap[index] = 'name';
            } else if (headerLower === 'instructor') {
              headerMap[index] = 'instructor';
            } else if (headerLower === 'supervisor') {
              headerMap[index] = 'supervisor';
            } else if (headerLower === 'co-supervisor') {
              headerMap[index] = 'coSupervisor';
            } else if (headerLower.includes('topic') || headerLower === 'title') {
              headerMap[index] = 'title';
            } else if (headerLower.includes('mid sem marks') || (headerLower.includes('mid') && headerLower.includes('marks'))) {
              headerMap[index] = 'midSemMarks';
            } else if ((headerLower === 'grade' && !headerLower.includes('end')) || 
                      (headerLower.includes('mid') && headerLower.includes('grade'))) {
              headerMap[index] = 'midSemGrade';
            } else if (headerLower.includes('end sem marks') || (headerLower.includes('end') && headerLower.includes('marks'))) {
              headerMap[index] = 'endSemMarks';
            } else if ((headerLower === 'grade' && headerMap[index-1] === 'endSemMarks') || 
                      headerLower === 'grade.1' || 
                      (headerLower.includes('end') && headerLower.includes('grade'))) {
              headerMap[index] = 'endSemGrade';
            }
          });
          
          const processedData: ProcessedRow[] = [];
          
          for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const rowData = rawData[i];
            if (!rowData || rowData.length === 0 || rowData.every(cell => cell === null || cell === undefined || cell === '')) {
              continue;
            }
            
            const processedRow: Record<string, any> = {
              courseType: courseType
            };
            
            let hasRequiredFields = false;
            
            Object.entries(headerMap).forEach(([indexStr, field]) => {
              const index = parseInt(indexStr, 10);
              let value = rowData[index];
              
              if (value !== null && value !== undefined) {
                if (field === 'erpId' || field === 'campusId') {
                  value = String(value).trim();
                  if (value) hasRequiredFields = true;
                } else if (field === 'midSemMarks' || field === 'endSemMarks') {
                  if (typeof value === 'string') {
                    const trimmed = value.trim();
                    value = trimmed ? Number(trimmed) : null;
                  } else if (typeof value !== 'number') {
                    value = null;
                  }
                } else if (typeof value === 'string') {
                  value = value.trim();
                }
              }
              
              processedRow[field] = value !== '' ? value : null;
            });
            
            if (hasRequiredFields && processedRow.erpId && processedRow.campusId) {
              processedData.push(processedRow as ProcessedRow);
            }
          }
          
          if (processedData.length === 0) {
            reject(new Error("No valid data found in Excel file"));
            return;
          }
          
          resolve(processedData);
        } catch (err) {
          reject(new Error(`Failed to process Excel file: ${(err as Error).message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!courseType) {
      setError("Please select a course type");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress(10);
    
    try {
      setProgress(30);
      const processedData = await processExcelFile(file);
      setProgress(60);
      
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      const response = await api.post(
        "/phd/staff/uploadExcelCourses",
        {
          data: processedData,
          courseType,
          replaceExisting
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(60 + (progressEvent.loaded * 40) / progressEvent.total);
              setProgress(percentCompleted);
            }
          },
        }
      );
      
      setSuccess(`Successfully processed the file. ${response.data?.insertedCount || 0} records were inserted/updated.`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to process the Excel file";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <Card className="p-6 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload PhD Course Excel File</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courseType">Course Type</Label>
          <Select
            value={courseType}
            onValueChange={(value) => setCourseType(value)}
          >
            <SelectTrigger id="courseType">
              <SelectValue placeholder="Select course type" />
            </SelectTrigger>
            <SelectContent>
              {courseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Excel File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            disabled={loading}
            ref={fileInputRef}
          />
          <p className="text-sm text-gray-500">
            Upload Excel file containing PhD course data
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="replaceExisting"
            checked={replaceExisting}
            onCheckedChange={(checked) => setReplaceExisting(checked === true)}
          />
          <Label htmlFor="replaceExisting" className="text-sm">
            Replace existing data for this course type
          </Label>
        </div>
        
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing file...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <FileCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload and Process
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default UploadExcelForm;
