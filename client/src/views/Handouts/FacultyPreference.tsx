import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Course {
    id: string;
    name: string;
    lpu: number;
    category: "FH" | "HD" | "PhD";
    type: "CDC" | "Elective";
}

interface SelectedCourse extends Course {
    preference: number;
}

export const FacultyPreference: React.FC = () => {
    const courses: Course[] = [
        { id: "CS101", name: "Introduction to Programming", lpu: 4, category: "FH", type: "CDC" },
        { id: "CS201", name: "Data Structures", lpu: 3, category: "FH", type: "CDC" },
        { id: "CS301", name: "Database Management", lpu: 4, category: "HD", type: "Elective" },
        { id: "CS401", name: "Computer Networks", lpu: 3, category: "PhD", type: "Elective" },
        { id: "CS501", name: "Artificial Intelligence", lpu: 4, category: "HD", type: "Elective" },
        { id: "CS601", name: "Machine Learning", lpu: 4, category: "PhD", type: "Elective" },
        { id: "CS701", name: "Web Development", lpu: 3, category: "FH", type: "CDC" },
        { id: "CS801", name: "Mobile App Development", lpu: 3, category: "HD", type: "CDC" },
    ];

    const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredCourses = courses.filter(course =>
        course.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCourseSelect = (course: Course) => {
        if (selectedCourses.find(c => c.id === course.id)) {
            return;
        }
        if (selectedCourses.length >= 5) {
            toast.error("You can only select up to 5 courses.");
            return;
        }
        setSelectedCourses([
            ...selectedCourses,
            { ...course, preference: selectedCourses.length + 1 }
        ]);
    };

    const handleDelete = (courseId: string) => {
        const updatedCourses = selectedCourses
            .filter(course => course.id !== courseId)
            .map((course, index) => ({
                ...course,
                preference: index + 1
            }));
        setSelectedCourses(updatedCourses);
    };

    const handleSubmit = () => {
        console.log("Submitted preferences:", selectedCourses);
        toast.success("Your course preferences have been submitted successfully.");
        // waiting for backend to implement
    };

    const isSelected = (courseId: string) => {
        return selectedCourses.some(course => course.id === courseId);
    };

    return (
        // Outer container takes the full viewport height and prevents page scrolling.
        <div className="w-full h-screen overflow-hidden space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">
                    Faculty Course Preferences 
                </h1>
                <p className="mt-2 text-gray-600">2nd semester 2024-25</p>
            </div>
            
            <Separator />
            
            <div className="flex gap-6 h-[calc(100%-160px)]">
                <div className="w-1/4 space-y-4 h-full">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="p-4 h-full overflow-y-auto border rounded-md">
                        <h3 className="font-medium mb-2">Available Courses</h3>
                        <Separator className="mb-2" />
                        <ul className="space-y-2">
                            {filteredCourses.map((course) => {
                                const courseSelected = isSelected(course.id);
                                return (
                                    <li 
                                        key={course.id} 
                                        className={`p-2 rounded-md ${
                                            courseSelected 
                                                ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                                                : "hover:bg-muted cursor-pointer"
                                        }`}
                                        onClick={() => !courseSelected && handleCourseSelect(course)}
                                    >
                                        <div className="font-medium">{course.id}</div>
                                        <div className="text-sm text-muted-foreground">{course.name}</div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                
                <Separator orientation="vertical" className="h-auto" />
                
                <div className="w-3/4">
                    <h3 className="font-medium mb-2">Selected Courses</h3>
                    <div className="rounded-lg h-600px overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Preference</TableHead>
                                    <TableHead>Course ID</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead>LPU</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>{course.preference}</TableCell>
                                        <TableCell>{course.id}</TableCell>
                                        <TableCell>{course.name}</TableCell>
                                        <TableCell>{course.lpu}</TableCell>
                                        <TableCell>{course.category}</TableCell>
                                        <TableCell>{course.type}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(course.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {selectedCourses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No courses selected yet. Please select courses from the list.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <Button 
                    onClick={handleSubmit}
                    disabled={selectedCourses.length === 0}
                >
                    Submit Preferences
                </Button>
            </div>
        </div>
    );
};

export default FacultyPreference;
