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
  title: '',
  description: '',
  category: 'general',
  project_id: '',
  file: null
}

function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => { loadDocuments() }, [])

  const loadDocuments = async (params = {}) => {
    setLoading(true)
    try {
      const response = await companyService.getDocuments(params)
      setDocuments(response)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    loadDocuments({ q: value, category: catFilter })
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
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || 'general',
      project_id: doc.project_id || '',
      file: null
    })
    setErrors([])
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e) => {
    setForm(prev => ({
      ...prev,
      file: e.target.files[0]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors([])

    try {
      const formData = new FormData()

      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(`document[${key}]`, form[key])
        }
      })

      let result

      if (editing) {
        result = await companyService.updateDocument(editing.id, formData)
        setDocuments(prev =>
          prev.map(d => d.id === editing.id ? result : d)
        )
      } else {
        result = await companyService.createDocument(formData)
        setDocuments(prev => [result, ...prev])
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
                catFilter === cat ? 'documents-page__cat-btn--active' : ''
              }`}
              onClick={() => handleCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="documents-page__loading">Loading...</div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No documents yet"
          description="Upload and manage your documents here."
          action={
            <Button variant="primary" onClick={openCreate}>
              + Upload Document
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
              <div className="doc-card__body">
                <h3>{doc.title}</h3>
                <p>{doc.description}</p>

                <span className="doc-card__category">
                  {doc.category}
                </span>
              </div>

              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Document' : 'Upload Document'}
      >
        <div className="doc-form">

          {errors.length > 0 && (
            <div className="doc-form__errors">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div>
            <label>Upload File</label>
            <input type="file" onChange={handleFileChange} />
          </div>

          <div className="doc-form__actions">
            {editing && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}

            <Button onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>

        </div>
      </Modal>
    </div>
  )
}

export default Documents