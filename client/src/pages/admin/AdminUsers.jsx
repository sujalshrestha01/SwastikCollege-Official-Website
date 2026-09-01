import { useEffect, useState } from 'react';
import { UserPlus, Copy, Check, Trash2, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import {
  listAdmins,
  inviteAdmin,
  updateAdminRole,
  resendInvite,
  deleteAdmin,
  changePassword,
} from '../../api/client';
import { Card, Field, Input, Select, Button, IconButton, Banner } from '../../components/admin/Ui';
import { useAuth } from '../../context/AuthContext';

function StatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        isActive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {isActive ? 'Active' : 'Pending'}
    </span>
  );
}

function RoleBadge({ role }) {
  const labels = {
    superadmin: 'Superadmin',
    editor: 'Editor',
    qaaVerifier: 'QAA Verifier',
  };
  const styles = {
    superadmin: 'bg-marigold-100 text-marigold-700',
    editor: 'bg-navy-100 text-navy-700',
    qaaVerifier: 'bg-blue-100 text-blue-700',
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        styles[role] || styles.editor
      }`}
    >
      {labels[role] || 'Editor'}
    </span>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Change your password" description="Update the password for your own account">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && <Banner type="error">{error}</Banner>}
        {success && <Banner type="success">{success}</Banner>}
        <Field label="Current password">
          <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </Field>
        <Field label="New password" hint="At least 8 characters">
          <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <Button type="submit" disabled={saving}>
          <KeyRound size={16} /> {saving ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </Card>
  );
}

function InvitePanel({ onInvited }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleInvite(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await inviteAdmin({ name, email, role });
      setResult(res);
      setName('');
      setEmail('');
      setRole('editor');
      onInvited();
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(result.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card
      title="Invite a new admin"
      description="Only superadmins can invite new admin accounts — there is no public sign-up"
    >
      <form onSubmit={handleInvite} className="space-y-4">
        {error && <Banner type="error">{error}</Banner>}
        {result && (
          <Banner type={result.emailSent ? 'success' : 'info'}>
            {result.emailSent ? (
              <p>Invite emailed to the address above. It expires in 48 hours and can only be used once.</p>
            ) : (
              <>
                <p className="mb-1">
                  Email could not be sent{result.emailError ? ` (${result.emailError})` : ''} — share this link with them directly:
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="break-all">{result.inviteLink}</span>
                  <Button type="button" variant="secondary" onClick={copyLink}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </>
            )}
          </Banner>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@swastikcollege.edu.np"
            />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="editor">Editor</option>
              <option value="superadmin">Superadmin</option>
              <option value="qaaVerifier">QAA Verifier (external, restricted)</option>
            </Select>
          </Field>
        </div>
        <Button type="submit" disabled={loading}>
          <UserPlus size={16} /> {loading ? 'Sending invite…' : 'Send Invite'}
        </Button>
      </form>
    </Card>
  );
}

function AdminRow({ item, currentAdminId, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isSelf = item._id === currentAdminId;

  async function handleRoleChange(e) {
    setError('');
    setBusy(true);
    try {
      await updateAdminRole(item._id, e.target.value);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError('');
    setBusy(true);
    try {
      await resendInvite(item._id);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${item.name}'s admin access?`)) return;
    setError('');
    setBusy(true);
    try {
      await deleteAdmin(item._id);
      onChanged();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-100 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-navy-800 truncate">{item.name}</p>
          {isSelf && <span className="text-xs text-navy-400">(you)</span>}
          <StatusBadge status={item.status} />
          <RoleBadge role={item.role} />
        </div>
        <p className="text-xs text-navy-500 mt-0.5 truncate">{item.email}</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isSelf && (
          <Select value={item.role} onChange={handleRoleChange} disabled={busy} className="text-xs py-1.5">
            <option value="editor">Editor</option>
            <option value="superadmin">Superadmin</option>
            <option value="qaaVerifier">QAA Verifier</option>
          </Select>
        )}
        {item.status === 'pending' && (
          <IconButton onClick={handleResend} disabled={busy} title="Resend invite">
            <RefreshCw size={16} />
          </IconButton>
        )}
        {!isSelf && (
          <IconButton variant="danger" onClick={handleDelete} disabled={busy} title="Remove access">
            <Trash2 size={16} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSuperadmin = admin?.role === 'superadmin';

  async function load() {
    if (!isSuperadmin) return;
    setLoading(true);
    setAdmins(await listAdmins());
    setLoading(false);
  }

  useEffect(() => { load(); }, [isSuperadmin]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-navy-800">User Management</h1>

      <ChangePasswordCard />

      {isSuperadmin ? (
        <>
          <InvitePanel onInvited={load} />

          <Card
            title="Admins & Editors"
            description="Manage everyone with access to this admin panel"
          >
            {loading ? (
              <p className="text-sm text-navy-400">Loading…</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-navy-400 text-center py-8">No admins found.</p>
            ) : (
              <div>
                {admins.map((item) => (
                  <AdminRow key={item._id} item={item} currentAdminId={admin.id} onChanged={load} />
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <div className="flex items-center gap-3 text-navy-500 py-4">
            <ShieldCheck size={20} />
            <p className="text-sm">Only superadmins can invite, view, or manage other admin accounts.</p>
          </div>
        </Card>
      )}
    </div>
  );
}