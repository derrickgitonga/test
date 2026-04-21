import { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Sprout, Plus, FileText, X } from 'lucide-react';

interface Field {
  id: string;
  name: string;
  cropType: string;
  currentStage: string;
  computedStatus: 'Active' | 'At Risk' | 'Completed';
  plantingDate: string;
  assignedAgent: { name: string };
}

interface Agent {
  id: string;
  name: string;
  role: string;
}

interface FieldUpdate {
  id: string;
  note: string;
  stageAtTimeOfUpdate: string;
  createdAt: string;
  agent: { name: string };
}

export default function AdminDashboard() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [createForm, setCreateForm] = useState({ name: '', cropType: '', plantingDate: '', assignedAgentId: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [historyField, setHistoryField] = useState<Field | null>(null);
  const [history, setHistory] = useState<FieldUpdate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    fetchFields();
    fetchAgents();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await api.get('/fields');
      setFields(res.data);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Failed to load fields. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users');
      setAgents(res.data.filter((u: Agent) => u.role === 'FIELD_AGENT'));
    } catch (e) {
      console.error(e);
    }
  };

  const closeCreate = () => {
    setShowCreate(false);
    setCreateError('');
    setCreateForm({ name: '', cropType: '', plantingDate: '', assignedAgentId: '' });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await api.post('/fields', {
        ...createForm,
        name: createForm.name.trim(),
        cropType: createForm.cropType.trim(),
      });
      closeCreate();
      fetchFields();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create field');
    } finally {
      setCreating(false);
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

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

  const total = fields.length;
  const activeCount = fields.filter(f => f.computedStatus === 'Active').length;
  const atRiskCount = fields.filter(f => f.computedStatus === 'At Risk').length;
  const completedCount = fields.filter(f => f.computedStatus === 'Completed').length;

  const getStatusClass = (status: string) => {
    if (status === 'Active') return 'status-active';
    if (status === 'At Risk') return 'status-at-risk';
    return 'status-completed';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Active') return <Clock className="w-4 h-4 mr-1" />;
    if (status === 'At Risk') return <AlertCircle className="w-4 h-4 mr-1" />;
    return <CheckCircle2 className="w-4 h-4 mr-1" />;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Fields</p>
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
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-semibold text-gray-600">{completedCount}</p>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800">All Fields Dashboard</h3>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Field
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Field Name</th>
                <th className="px-6 py-3 font-medium">Crop</th>
                <th className="px-6 py-3 font-medium">Agent</th>
                <th className="px-6 py-3 font-medium">Stage</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Planted Date</th>
                <th className="px-6 py-3 font-medium">Updates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map(field => (
                <tr key={field.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{field.name}</td>
                  <td className="px-6 py-4 text-gray-600">{field.cropType}</td>
                  <td className="px-6 py-4 text-gray-600">{field.assignedAgent.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {field.currentStage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(field.computedStatus)}`}>
                      {getStatusIcon(field.computedStatus)}
                      {field.computedStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(field.plantingDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openHistory(field)}
                      className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      View Updates
                    </button>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No fields found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-900">Create New Field</h3>
              <button onClick={closeCreate} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">{createError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="North Wheat Field"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Crop Type</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Wheat"
                  value={createForm.cropType}
                  onChange={e => setCreateForm({ ...createForm, cropType: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planting Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={createForm.plantingDate}
                  onChange={e => setCreateForm({ ...createForm, plantingDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Agent</label>
                <select
                  required
                  className="input-field"
                  value={createForm.assignedAgentId}
                  onChange={e => setCreateForm({ ...createForm, assignedAgentId: e.target.value })}
                >
                  <option value="">Select an agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeCreate} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : 'Create Field'}
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
