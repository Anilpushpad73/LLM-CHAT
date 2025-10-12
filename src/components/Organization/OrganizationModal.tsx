import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { X, Building2, Users, Mail, Plus, Edit2, Check } from 'lucide-react';
import api from '../../services/api';
import {
  setOrganizations,
  setCurrentOrganization,
  addOrganization,
  updateOrganization
} from '../../store/slices/organizationSlice';
import { setChats } from '../../store/slices/chatSlice';

interface OrganizationModalProps {
  onClose: () => void;
}

const OrganizationModal = ({ onClose }: OrganizationModalProps) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'members'>('list');
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const organizations = useSelector((state: RootState) => state.organization.organizations);
  const currentOrganization = useSelector((state: RootState) => state.organization.currentOrganization);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await api.get('/organization/list');
      dispatch(setOrganizations(response.data.organizations));

      if (user?.activeOrganizationId) {
        const orgRes = await api.get(`/organization/${user.activeOrganizationId}`);
        dispatch(setCurrentOrganization(orgRes.data.organization));
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/organization/create', { name: newOrgName });
      dispatch(addOrganization(response.data.organization));
      dispatch(setCurrentOrganization(response.data.organization));
      dispatch(setChats([]));
      setNewOrgName('');
      setActiveTab('list');
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameOrganization = async (orgId: string) => {
    if (!editOrgName.trim()) return;

    setLoading(true);
    try {
      const response = await api.put(`/organization/${orgId}/rename`, { name: editOrgName });
      dispatch(updateOrganization(response.data.organization));
      setEditingOrgId(null);
      setEditOrgName('');
    } catch (error) {
      console.error('Error renaming organization:', error);
      alert('Failed to rename organization');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId: string) => {
    setLoading(true);
    try {
      await api.put(`/organization/switch/${orgId}`);
      const orgRes = await api.get(`/organization/${orgId}`);
      dispatch(setCurrentOrganization(orgRes.data.organization));

      const chatsRes = await api.get('/chat/list');
      dispatch(setChats(chatsRes.data.chats));

      onClose();
    } catch (error) {
      console.error('Error switching organization:', error);
      alert('Failed to switch organization');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentOrganization) return;

    setLoading(true);
    try {
      const response = await api.post(`/organization/${currentOrganization._id}/invite`, {
        email: inviteEmail
      });
      dispatch(updateOrganization(response.data.organization));
      setInviteEmail('');
      alert('Invitation sent successfully!');
    } catch (error: any) {
      console.error('Error inviting member:', error);
      alert(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Organizations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Building2 className="w-5 h-5 inline mr-2" />
            My Organizations
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create New
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-3 font-semibold transition ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Members
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'list' && (
            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org._id}
                  className={`p-4 border-2 rounded-lg transition ${
                    currentOrganization?._id === org._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingOrgId === org._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editOrgName}
                            onChange={(e) => setEditOrgName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Organization name"
                          />
                          <button
                            onClick={() => handleRenameOrganization(org._id)}
                            disabled={loading}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrgId(null);
                              setEditOrgName('');
                            }}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-800">{org.name}</h3>
                          {org.members.some(
                            (m) => m.userId._id === user?.id && m.role === 'admin'
                          ) && (
                            <button
                              onClick={() => {
                                setEditingOrgId(org._id);
                                setEditOrgName(org.name);
                              }}
                              className="ml-2 p-1 hover:bg-gray-200 rounded transition"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {org.members.length} member{org.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {currentOrganization?._id !== org._id && (
                      <button
                        onClick={() => handleSwitchOrganization(org._id)}
                        disabled={loading}
                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter organization name"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newOrgName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          )}

          {activeTab === 'members' && currentOrganization && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Members of {currentOrganization.name}
                </h3>
                <div className="space-y-2">
                  {currentOrganization.members.map((member) => (
                    <div
                      key={member.userId._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {member.userId.username}
                        </p>
                        <p className="text-sm text-gray-600">{member.userId.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {currentOrganization.invitations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Pending Invitations
                  </h3>
                  <div className="space-y-2">
                    {currentOrganization.invitations
                      .filter((inv) => inv.status === 'pending')
                      .map((invitation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">{invitation.email}</p>
                            <p className="text-sm text-gray-600">
                              Invited by {invitation.invitedBy.username}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite New Member</h3>
                <form onSubmit={handleInviteMember} className="flex space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="member@example.com"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !inviteEmail.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Invite
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'members' && !currentOrganization && (
            <div className="text-center text-gray-500">
              <p>No organization selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationModal;
