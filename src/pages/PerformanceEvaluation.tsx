import React, { useState, useEffect } from 'react';
import { usePerformanceStore } from '../store/performanceStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import {
  Calendar,
  Target,
  Award,
  MessageSquare,
  Download,
  Clock,
} from 'lucide-react';

export function PerformanceEvaluation() {
  const { employees, evaluations, calculateScore } = usePerformanceStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const selectedEmployeeData = employees.find((e) => e.id === selectedEmployee);
  const scores = selectedEmployee ? calculateScore(selectedEmployee) : null;

  const generatePDF = () => {
    if (!selectedEmployeeData || !scores) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Avaliação de Desempenho', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Colaborador: ${selectedEmployeeData.name}`, 20, 40);
    doc.text(`Cargo: ${selectedEmployeeData.position}`, 20, 50);
    doc.text(`Departamento: ${selectedEmployeeData.department}`, 20, 60);
    
    doc.text('Pontuações:', 20, 80);
    doc.text(`Metas: ${scores.goalScore.toFixed(2)}`, 30, 90);
    doc.text(`Competências: ${scores.competencyScore.toFixed(2)}`, 30, 100);
    doc.text(`Feedbacks: ${scores.feedbackScore.toFixed(2)}`, 30, 110);
    doc.text(`Nota Final: ${scores.finalScore.toFixed(2)}`, 20, 130);
    
    doc.save(`avaliacao-${selectedEmployeeData.name}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Avaliação de Desempenho
        </h2>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecione um colaborador</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployeeData && scores && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <Target className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Metas</p>
                  <p className="text-2xl font-bold">{scores.goalScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <Award className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Competências</p>
                  <p className="text-2xl font-bold">
                    {scores.competencyScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-10 w-10 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Feedbacks</p>
                  <p className="text-2xl font-bold">
                    {scores.feedbackScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4">
                <Award className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Nota Final</p>
                  <p className="text-2xl font-bold">{scores.finalScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Progresso das Metas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={selectedEmployeeData.goals}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="description" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="target" fill="#93c5fd" name="Meta" />
                  <Bar dataKey="achieved" fill="#3b82f6" name="Realizado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competencies Radar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Competências</h3>
            <div className="space-y-4">
              {selectedEmployeeData.competencies.map((comp) => (
                <div key={comp.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {comp.name}
                    </span>
                    <span className="text-sm text-gray-600">{comp.score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(comp.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Feedbacks Recentes</h3>
            <div className="space-y-4">
              {selectedEmployeeData.feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`p-4 rounded-lg ${
                    feedback.type === 'positive'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } border`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">{feedback.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Por: {feedback.author}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{feedback.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}