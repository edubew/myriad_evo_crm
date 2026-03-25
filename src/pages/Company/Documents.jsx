import { useState, useEffect } from 'react'
import { companyService } from '../../services/companyService'
import Button from '../../components/ui/Button/Button'
import Modal from '../../components/ui/Modal/Modal'
import Input from '../../components/ui/Input/Input'
import EmptyState from '../../components/ui/EmptyState/EmptyState'
import './Documents.scss'

const CATEGORIES = [
  'contract', 'proposal', 'template',
  'brief', 'report', 'policy', 'general'
]

const CATEGORY_COLORS = {
  contract:  '#8B2A2A',
  proposal:  '#B34A30',
  template:  '#A87830',
  brief:     '#4A8C6A',
  report:    '#7A8A96',
  policy:    '#6B4A8A',
  general:   '#4A6A8A'
}

const defaultForm = {
  title: '', description: '', file_url: '',
  file_name: '', file_type: '',
  category: 'general', project_id: ''
}

function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(defaultForm)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState([])
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => { loadDocuments() }, [])

  const loadDocuments = async (params = {}) => {
    setLoading(true)
    try {
      const data = await companyService.getDocuments(params)
      setDocuments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    loadDocuments({ q: e.target.value, category: catFilter })
  }

  const handleCategoryFilter = (cat) => {
    const newCat = cat === catFilter ? '' : cat
    setCatFilter(newCat)
    loadDocuments({ q: search, category: newCat })
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setErrors([])
    setModalOpen(true)
  }

  const openEdit = (doc) => {
    setEditing(doc)
    setForm({
      title:       doc.title       || '',
      description: doc.description || '',
      file_url:    doc.file_url    || '',
      file_name:   doc.file_name   || '',
      file_type:   doc.file_type   || '',
      category:    doc.category    || 'general',
      project_id:  doc.project_id  || ''
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
        const updated = await companyService.updateDocument(
          editing.id, form
        )
        setDocuments(prev => prev.map(d =>
          d.id === editing.id ? updated : d
        ))
      } else {
        const newDoc = await companyService.createDocument(form)
        setDocuments(prev => [newDoc, ...prev])
      }
      setModalOpen(false)
    } catch (err) {
      setErrors(err.response?.data?.errors || ['Something went wrong'])
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this document?')) return
    await companyService.deleteDocument(editing.id)
    setDocuments(prev => prev.filter(d => d.id !== editing.id))
    setModalOpen(false)
  }

  return (
    <div className="documents-page">

      <div className="documents-page__header">
        <div>
          <h1 className="documents-page__title">Documents</h1>
          <p className="documents-page__subtitle">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + New Document
        </Button>
      </div>

      <div className="documents-page__filters">
        <input
          className="documents-page__search"
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={handleSearch}
        />
        <div className="documents-page__cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`documents-page__cat-btn ${
                catFilter === cat
                  ? 'documents-page__cat-btn--active'
                  : ''
              }`}
              style={catFilter === cat ? {
                borderColor: CATEGORY_COLORS[cat],
                color: CATEGORY_COLORS[cat],
                background: `${CATEGORY_COLORS[cat]}15`
              } : {}}
              onClick={() => handleCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="documents-page__loading">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No documents yet"
          description="Store contracts, proposals, templates and project briefs here."
          action={
            <Button variant="primary" onClick={openCreate}>
              + New Document
            </Button>
          }
        />
      ) : (
        <div className="documents-grid">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="doc-card"
              onClick={() => openEdit(doc)}
            >
              <div
                className="doc-card__icon-wrap"
                style={{
                  background: `${CATEGORY_COLORS[doc.category] || '#8B2A2A'}15`,
                  color: CATEGORY_COLORS[doc.category] || '#8B2A2A'
                }}
              >
                <span className="doc-card__icon">{doc.icon}</span>
              </div>

              <div className="doc-card__body">
                <h3 className="doc-card__title">{doc.title}</h3>
                {doc.description && (
                  <p className="doc-card__desc">{doc.description}</p>
                )}
                <div className="doc-card__meta">
                  <span
                    className="doc-card__category"
                    style={{
                      color: CATEGORY_COLORS[doc.category] || '#8B2A2A',
                      background: `${CATEGORY_COLORS[doc.category] || '#8B2A2A'}15`
                    }}
                  >
                    {doc.category}
                  </span>
                  {doc.formatted_size && (
                    <span className="doc-card__size">
                      {doc.formatted_size}
                    </span>
                  )}
                </div>
              </div>

              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-card__open"
                  onClick={e => e.stopPropagation()}
                  title="Open document"
                >
                  ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Document' : 'New Document'}
        size="lg"
      >
        <div className="doc-form">
          {errors.length > 0 && (
            <div className="doc-form__errors">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <Input
            label="Document Title"
            name="title"
            placeholder="Service Agreement Template"
            value={form.title}
            onChange={handleChange}
          />

          <div className="doc-form__field">
            <label className="doc-form__label">Description</label>
            <textarea
              className="doc-form__textarea"
              name="description"
              placeholder="What is this document?"
              value={form.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="doc-form__field">
            <label className="doc-form__label">Category</label>
            <select
              className="doc-form__select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="File URL (Google Drive, Dropbox, etc.)"
            name="file_url"
            placeholder="https://drive.google.com/..."
            value={form.file_url}
            onChange={handleChange}
          />

          <div className="doc-form__row">
            <Input
              label="File Name"
              name="file_name"
              placeholder="contract.pdf"
              value={form.file_name}
              onChange={handleChange}
            />
            <div className="doc-form__field">
              <label className="doc-form__label">File Type</label>
              <select
                className="doc-form__select"
                name="file_type"
                value={form.file_type}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                {['pdf', 'doc', 'docx', 'xls', 'xlsx',
                  'ppt', 'pptx', 'jpg', 'png', 'zip', 'other'
                ].map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="doc-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="doc-form__actions-right">
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
                {editing ? 'Save changes' : 'Save document'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Documents