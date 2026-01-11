import { useState, useEffect } from "react";
import api from "../utils/axiosInstance";

const EnrolledStudentsList = ({ classId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await api.get(`/api/attendance/live/${classId}`);
                setStudents(data || []);
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
                    <th className="py-3 px-4 text-center">Status</th>
                     <th className="py-3 px-4">Joined</th>
                </tr>
            </thead>
            <tbody className="text-gray-300">
                {students.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">No students enrolled yet.</td>
                    </tr>
                ) : (
                    students.map((student) => (
                        <tr key={student._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-white">{student.name}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{student.email}</td>
                            <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                    student.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    student.status === 'Absent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                    {student.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-gray-400">
                                {student.joinTime ? new Date(student.joinTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default EnrolledStudentsList;
