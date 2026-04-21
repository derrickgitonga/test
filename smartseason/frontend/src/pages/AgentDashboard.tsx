import { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { Sprout, Edit2, FileText, X } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  cropType: string;
  currentStage: string;
  computedStatus: 'Active' | 'At Risk' | 'Completed';
  plantingDate: string;
}

interface FieldUpdate {
  id: string;
  note: string;
  stageAtTimeOfUpdate: string;
  createdAt: string;
  agent: { name: string };
}

export default function AgentDashboard() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [newStage, setNewStage] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const [historyField, setHistoryField] = useState<Field | null>(null);
  const [history, setHistory] = useState<FieldUpdate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await api.get('/fields');
      setFields(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stages = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedField) return;
    setUpdateError('');
    setUpdating(true);
    try {
      if (newStage && newStage !== selectedField.currentStage) {
        await api.patch(`/fields/${selectedField.id}/stage`, { stage: newStage });
      }
      if (note.trim()) {
        await api.post(`/fields/${selectedField.id}/updates`, { note: note.trim() });
      }
      setSelectedField(null);
      setNote('');
      fetchFields();
    } catch (e: any) {
      setUpdateError(e.response?.data?.message || 'Failed to update field');
    } finally {
      setUpdating(false);
    }
  };

  const openHistory = async (field: Field) => {
    setHistoryField(field);
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    try {
      const res = await api.get(`/fields/${field.id}/updates`);
      setHistory(res.data);
    } catch (e) {
      console.error(e);
      setHistoryError('Failed to load update history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading your fields...</div>;

  const total = fields.length;
  const activeCount = fields.filter(f => f.computedStatus === 'Active').length;
  const atRiskCount = fields.filter(f => f.computedStatus === 'At Risk').length;

  const getStatusClass = (status: string) => {
    if (status === 'Active') return 'status-active';
    if (status === 'At Risk') return 'status-at-risk';
    return 'status-completed';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Assigned Fields</p>
            <p className="text-2xl font-semibold text-slate-900">{total}</p>
          </div>
          <Sprout className="h-8 w-8 text-emerald-500 opacity-20" />
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-emerald-600">{activeCount}</p>
          </div>
        </div>
        <div className="card flex items-center justify-between border-amber-200 bg-amber-50/30">
          <div>
            <p className="text-sm font-medium text-gray-500">At Risk</p>
            <p className="text-2xl font-semibold text-amber-600">{atRiskCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fields.map(field => (
          <div key={field.id} className="card hover:border-emerald-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{field.name}</h3>
                <p className="text-sm text-gray-500">{field.cropType}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(field.computedStatus)}`}>
                {field.computedStatus}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Stage:</span>
                <span className="font-medium text-slate-700">{field.currentStage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Planted:</span>
                <span className="text-slate-700">{format(new Date(field.plantingDate), 'MMM d, yyyy')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedField(field);
                  setNewStage(field.currentStage);
                  setNote('');
                  setUpdateError('');
                }}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Update
              </button>
              <button
                onClick={() => openHistory(field)}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                History
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <Sprout className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields assigned</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any fields assigned to you yet.</p>
          </div>
        )}
      </div>

      {selectedField && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-900">Update {selectedField.name}</h3>
              <button onClick={() => setSelectedField(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              {updateError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">{updateError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Update Stage</label>
                <select
                  className="input-field"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                >
                  {stages.map((stg, idx) => (
                    <option
                      key={stg}
                      value={stg}
                      disabled={idx < stages.indexOf(selectedField.currentStage)}
                    >
                      {stg}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Stages can only move forward.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Note (Optional)</label>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Observed slight yellowing on leaves..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setSelectedField(null)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={updating} className="btn-primary">
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyField && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{historyField.name}</h3>
                <p className="text-sm text-gray-500">Update History</p>
              </div>
              <button onClick={() => setHistoryField(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {historyLoading && <p className="text-sm text-gray-500 py-4 text-center">Loading...</p>}
              {historyError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">{historyError}</div>
              )}
              {!historyLoading && !historyError && history.length === 0 && (
                <p className="text-sm text-gray-500 py-8 text-center">No updates have been logged for this field yet.</p>
              )}
              {!historyLoading && history.length > 0 && (
                <div className="space-y-3">
                  {history.map(update => (
                    <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-800">{update.agent.name}</span>
                        <span className="text-xs text-gray-400">{format(new Date(update.createdAt), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{update.note}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {update.stageAtTimeOfUpdate}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
