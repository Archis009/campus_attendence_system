import { useState, useEffect } from "react";
import api from "../utils/axiosInstance";

const EnrolledStudentsList = ({ classId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await api.get(`/api/classes/${classId}`);
                setStudents(data.students || []);
            } catch (error) {
                console.error("Error fetching students", error);
            } finally {
                setLoading(false);
            }
        };

        if (classId) fetchStudents();
    }, [classId]);

    if (loading) return <div className="text-center py-4">Loading students...</div>;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                </tr>
            </thead>
            <tbody className="text-gray-300">
                {students.length === 0 ? (
                    <tr>
                        <td colSpan="2" className="py-8 text-center text-gray-500">No students enrolled yet.</td>
                    </tr>
                ) : (
                    students.map((student) => (
                        <tr key={student._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-white">{student.name}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{student.email}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default EnrolledStudentsList;
