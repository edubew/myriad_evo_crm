import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import Modal from "../../components/ui/Modal/Modal";
import Input from "../../components/ui/Input/Input";
import Avatar from "../../components/ui/Avatar/Avatar";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import api from "../../services/api";
import "./AppUsers.scss";

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "member",
};

function AppUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setErrors([]);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setErrors([]);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);
    try {
      if (editing) {
        const res = await api.put(`/users/${editing.id}`, {
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === editing.id ? res.data.data : u)),
        );
      } else {
        const res = await api.post("/users", {
          user: form
        });
        setUsers((prev) => [...prev, res.data.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this user's access?")) return;
    try {
      await api.delete(`/users/${editing.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== editing.id));
      setModalOpen(false);
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Cannot delete user"]);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="app-users-page">
      <div className="app-users-page__header">
        <div>
          <h1 className="app-users-page__title">App Users</h1>
          <p className="app-users-page__subtitle">
            {users.length} user{users.length !== 1 ? "s" : ""} with access
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreate}>
            + Add User
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="app-users-page__notice">
          Only admins can manage user access.
        </div>
      )}

      {loading ? (
        <div className="app-users-page__loading">Loading users...</div>
      ) : users.length === 0 ? (
        <EmptyState
          icon="⬡"
          title="No users yet"
          description="Add team members so they can log in and collaborate."
        />
      ) : (
        <div className="app-users-grid">
          {users.map((user) => (
            <div
              key={user.id}
              className="app-user-card"
              onClick={() => isAdmin && openEdit(user)}
              style={{ cursor: isAdmin ? "pointer" : "default" }}
            >
              <Avatar src={user.avatar} name={user.full_name} size="lg" />
              <div className="app-user-card__info">
                <div className="app-user-card__name">
                  {user.full_name}
                  {user.id === currentUser?.id && (
                    <span className="app-user-card__you">you</span>
                  )}
                </div>
                <div className="app-user-card__email">{user.email}</div>
                <span
                  className={`app-user-card__role app-user-card__role--${user.role}`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? "Edit User" : "Add Team Member"}
          size="lg"
        >
          <div className="app-user-form">
            {errors.length > 0 && (
              <div className="app-user-form__errors">
                {errors.map((e, i) => (
                  <div key={i}>{e}</div>
                ))}
              </div>
            )}

            <div className="app-user-form__row">
              <Input
                label="First Name"
                name="first_name"
                placeholder="somebody"
                value={form.first_name}
                onChange={handleChange}
              />
              <Input
                label="Last Name"
                name="last_name"
                placeholder="somebody"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>

            {!editing && (
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="whoever@myriadevo.com"
                value={form.email}
                onChange={handleChange}
              />
            )}

            {!editing && (
              <Input
                label="Temporary Password"
                type="password"
                name="password"
                placeholder="They can change this after first login"
                value={form.password}
                onChange={handleChange}
              />
            )}

            <div className="app-user-form__field">
              <label className="app-user-form__label">Role</label>
              <select
                className="app-user-form__select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="app-user-form__hint">
              {editing
                ? "Share updated details with the team member directly."
                : "Share the email and temporary password with the team member. They can log in immediately."}
            </div>

            <div className="app-user-form__actions">
              {editing && editing.id !== currentUser?.id && (
                <Button variant="danger" onClick={handleDelete}>
                  Remove access
                </Button>
              )}
              <div className="app-user-form__actions-right">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} loading={saving}>
                  {editing ? "Save changes" : "Create account"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AppUsers;
