import { useState, useEffect } from 'react'
import { companyService } from '../../services/companyService'
import Button from '../../components/ui/Button/Button'
import Modal from '../../components/ui/Modal/Modal'
import Input from '../../components/ui/Input/Input'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import './Team.scss'

const DEPARTMENTS = [
  'Engineering', 'Design', 'Product', 'Sales',
  'Marketing', 'Finance', 'Operations', 'Other'
]

const defaultForm = {
  first_name: '', last_name: '',
  email: '', phone: '',
  role: '', department: '', bio: ''
}

function Team() {
  const [members, setMembers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(defaultForm)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState([])

  useEffect(() => { loadTeam() }, [])

  const loadTeam = async () => {
    setLoading(true)
    try {
      const data = await companyService.getTeam()
      setMembers(data)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setErrors([])
    setModalOpen(true)
  }

  const openEdit = (member) => {
    setEditing(member)
    setForm({
      first_name: member.first_name || '',
      last_name:  member.last_name  || '',
      email:      member.email      || '',
      phone:      member.phone      || '',
      role:       member.role       || '',
      department: member.department || '',
      bio:        member.bio        || ''
    })
    setErrors([])
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors([])
    try {
      if (editing) {
        const updated = await companyService.updateMember(editing.id, form)
        setMembers(prev => prev.map(m =>
          m.id === editing.id ? updated : m
        ))
      } else {
        const newMember = await companyService.createMember(form)
        setMembers(prev => [...prev, newMember])
      }
      setModalOpen(false)
    } catch (err) {
      setErrors(err.response?.data?.errors || ['Something went wrong'])
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Remove this team member?')) return
    await companyService.deleteMember(editing.id)
    setMembers(prev => prev.filter(m => m.id !== editing.id))
    setModalOpen(false)
  }

  const DEPT_COLORS = {
    Engineering: '#8B2A2A', Design: '#B34A30',
    Product: '#A87830', Sales: '#4A8C6A',
    Marketing: '#7A8A96', Finance: '#6B4A8A',
    Operations: '#4A6A8A', Other: '#8A6A4A'
  }

  return (
    <div className="team-page">

      <div className="team-page__header">
        <div>
          <h1 className="team-page__title">Team</h1>
          <p className="team-page__subtitle">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + Add Member
        </Button>
      </div>

      {loading ? (
        <div className="team-page__loading">Loading team...</div>
      ) : members.length === 0 ? (
        <EmptyState
          icon="⬡"
          title="No team members yet"
          description="Add your team to assign tasks and track who does what."
          action={
            <Button variant="primary" onClick={openCreate}>
              + Add Member
            </Button>
          }
        />
      ) : (
        <div className="team-grid">
          {members.map(member => (
            <div
              key={member.id}
              className="member-card"
              onClick={() => openEdit(member)}
            >
              <div className="member-card__avatar" style={{
                background: `${DEPT_COLORS[member.department] || '#8B2A2A'}20`,
                color: DEPT_COLORS[member.department] || '#8B2A2A'
              }}>
                {member.initials}
              </div>
              <div className="member-card__info">
                <h3 className="member-card__name">{member.full_name}</h3>
                {member.role && (
                  <p className="member-card__role">{member.role}</p>
                )}
                {member.department && (
                  <span
                    className="member-card__dept"
                    style={{
                      color: DEPT_COLORS[member.department] || '#8B2A2A',
                      background: `${DEPT_COLORS[member.department] || '#8B2A2A'}15`
                    }}
                  >
                    {member.department}
                  </span>
                )}
              </div>
              <div className="member-card__contact">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="member-card__contact-link"
                    onClick={e => e.stopPropagation()}
                  >
                    {member.email}
                  </a>
                )}
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="member-card__contact-link"
                    onClick={e => e.stopPropagation()}
                  >
                    {member.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Team Member' : 'Add Team Member'}
        size="lg"
      >
        <div className="team-form">
          {errors.length > 0 && (
            <div className="team-form__errors">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <div className="team-form__row">
            <Input
              label="First Name"
              name="first_name"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="last_name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="team-form__row">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="john@myriadevo.com"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              placeholder="+254 700 000 000"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="team-form__row">
            <Input
              label="Role / Title"
              name="role"
              placeholder="Senior Developer"
              value={form.role}
              onChange={handleChange}
            />
            <div className="team-form__field">
              <label className="team-form__label">Department</label>
              <select
                className="team-form__select"
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="team-form__field">
            <label className="team-form__label">Bio</label>
            <textarea
              className="team-form__textarea"
              name="bio"
              placeholder="A short bio..."
              value={form.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="team-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Remove
              </Button>
            )}
            <div className="team-form__actions-right">
              <Button
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
              >
                {editing ? 'Save changes' : 'Add member'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Team