import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const excelFilePath = './Courses registered by HD & PhD students for II Semester 2024-25_EEE.xlsx';
const outputDir = './cleaned_jsons';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

interface CleanedRow {
  serialNo: number;
  emplId: number;
  campusId: string;
  name?: string;
  instructor?: string;
  supervisor?: string;
  coSupervisor?: string;
  courseTopic?: string;
  midSemMarks: number | null;
  midSemGrade: string | null;
  endSemMarks: number | null;
  endSemGrade: string | null;
}

type PartialRow = {
  [K in keyof CleanedRow]?: string | number | null | undefined;
};

function findHeaderRow(sheet: any[][]): { headerRowIndex: number, headers: string[] } {
  for (let i = 0; i < sheet.length; i++) {
    const row = sheet[i];
    if (!row) continue;
    
    const rowStr = row.join(' ').toLowerCase();
    if (rowStr.includes('s.no') && (rowStr.includes('emplid') || rowStr.includes('empl id') || rowStr.includes('erp id')) && rowStr.includes('campus id')) {
      const headers = row.map(cell => cell !== null && cell !== undefined ? String(cell) : '');
      return { headerRowIndex: i, headers };
    }
  }
  
  // To check for as most of our header starts at 11 but just for safety wkept it for 7-13
  const commonHeaderRows = [7, 8, 9, 10, 11, 12, 13];
  for (const rowIndex of commonHeaderRows) {
    if (rowIndex >= sheet.length) continue;
    
    const row = sheet[rowIndex];
    if (!row) continue;
    
    const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '');
    if (nonEmptyCells.length >= 3) {
      const rowStr = row.join(' ').toLowerCase();
      if (rowStr.includes('name') || rowStr.includes('id') || rowStr.includes('marks')) {
        const headers = row.map(cell => cell !== null && cell !== undefined ? String(cell) : '');
        return { headerRowIndex: rowIndex, headers };
      }
    }
  }
  return { headerRowIndex: -1, headers: [] };
}

function createHeaderMap(headers: string[]): Record<number, keyof CleanedRow> {
  const headerMap: Record<number, keyof CleanedRow> = {};
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const headerLower = header.toLowerCase();
    
    if (headerLower.includes('s.no') || headerLower === 'sno') {
      headerMap[index] = 'serialNo';
    } else if (headerLower.includes('empl id') || headerLower === 'emplid' || headerLower === 'erp id') {
      headerMap[index] = 'emplId';
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
      headerMap[index] = 'courseTopic';
    } else if (headerLower.includes('mid sem marks') || (headerLower.includes('mid') && headerLower.includes('marks'))) {
      headerMap[index] = 'midSemMarks';
    } else if ((headerLower === 'grade' && !headerMap[index-1]?.includes('end')) || 
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
  
  return headerMap;
}

function cleanRow(rowData: any[], headerMap: Record<number, keyof CleanedRow>): CleanedRow | null {
  const partial: PartialRow = {};
  
  Object.entries(headerMap).forEach(([indexStr, field]) => {
    const index = parseInt(indexStr, 10);
    const value = rowData[index];
    partial[field] = value;
  });

  if (!partial.serialNo && !partial.emplId && !partial.campusId) {
    return null;
  }

  if (partial.serialNo == null || (typeof partial.serialNo === 'string' && partial.serialNo.trim() === '')) {
    return null;
  }
  const parsedSerial = Number(partial.serialNo);
  if (isNaN(parsedSerial)) return null;
  partial.serialNo = parsedSerial;

  if (partial.emplId == null || (typeof partial.emplId === 'string' && partial.emplId.trim() === '')) {
    return null;
  }
  const parsedEmpl = Number(partial.emplId);
  if (isNaN(parsedEmpl)) return null;
  partial.emplId = parsedEmpl;

  if (partial.campusId == null || String(partial.campusId).trim() === '') {
    return null;
  }
  partial.campusId = String(partial.campusId).trim();

  if (partial.midSemMarks != null) {
    if (typeof partial.midSemMarks === 'string') {
      const trimmed = partial.midSemMarks.trim();
      if (!trimmed) {
        partial.midSemMarks = null;
      } else {
        const num = Number(trimmed);
        partial.midSemMarks = isNaN(num) ? null : num;
      }
    } else if (typeof partial.midSemMarks !== 'number') {
      partial.midSemMarks = null;
    }
  } else {
    partial.midSemMarks = null;
  }

  if (partial.endSemMarks != null) {
    if (typeof partial.endSemMarks === 'string') {
      const trimmed = partial.endSemMarks.trim();
      if (!trimmed) {
        partial.endSemMarks = null;
      } else {
        const num = Number(trimmed);
        partial.endSemMarks = isNaN(num) ? null : num;
      }
    } else if (typeof partial.endSemMarks !== 'number') {
      partial.endSemMarks = null;
    }
  } else {
    partial.endSemMarks = null;
  }

  if (partial.midSemGrade != null && typeof partial.midSemGrade === 'string') {
    const trimmed = partial.midSemGrade.trim();
    partial.midSemGrade = trimmed === '' ? null : trimmed;
  } else {
    partial.midSemGrade = null;
  }

  if (partial.endSemGrade != null && typeof partial.endSemGrade === 'string') {
    const trimmed = partial.endSemGrade.trim();
    partial.endSemGrade = trimmed === '' ? null : trimmed;
  } else {
    partial.endSemGrade = null;
  }

  if (partial.name != null) {
    partial.name = String(partial.name).trim();
  }

  if (partial.instructor != null) {
    partial.instructor = String(partial.instructor).trim();
  }

  if (partial.supervisor != null) {
    partial.supervisor = String(partial.supervisor).trim();
  }

  if (partial.coSupervisor != null) {
    partial.coSupervisor = String(partial.coSupervisor).trim();
  }

  if (partial.courseTopic != null) {
    partial.courseTopic = String(partial.courseTopic).trim();
  }

  return partial as CleanedRow;
}

function processWorksheet(worksheet: XLSX.WorkSheet, sheetName: string): CleanedRow[] {
  console.log(`Processing sheet: ${sheetName}`);
  
  const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: null });
  
  const { headerRowIndex, headers } = findHeaderRow(rawData);
  
  if (headerRowIndex === -1) {
    console.log(`Could not find header row in sheet: ${sheetName}`);
    return [];
  }
  
  console.log(`Found header row at index ${headerRowIndex}`);
  console.log(`Headers: ${headers.filter(Boolean).join(', ')}`);
  
  const headerMap = createHeaderMap(headers);
  console.log(`Header mapping: ${JSON.stringify(headerMap)}`);
  
  const cleanedRows: CleanedRow[] = [];
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const rowData = rawData[i];
    if (!rowData || rowData.length === 0 || rowData.every(cell => cell === null || cell === undefined || cell === '')) {
      continue;
    }
    
    const cleanedRow = cleanRow(rowData, headerMap);
    if (cleanedRow) {
      cleanedRows.push(cleanedRow);
    }
  }
  
  return cleanedRows;
}

try {
  console.log(`Reading Excel file: ${excelFilePath}`);
  const workbook = XLSX.readFile(excelFilePath);
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    
    const cleanedRows = processWorksheet(worksheet, sheetName);
    
    const safeSheetName = sheetName.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
    const outPath = path.join(outputDir, `${safeSheetName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(cleanedRows, null, 2), 'utf8');
    
    console.log(`Saved ${cleanedRows.length} rows to ${outPath}`);
  });
  
  console.log('Processing completed successfully!');
} catch (error) {
  console.error('Error processing Excel file:', error);
}
