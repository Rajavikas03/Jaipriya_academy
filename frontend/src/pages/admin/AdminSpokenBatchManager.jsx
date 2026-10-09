import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Plus, Trash2, Edit3, CheckCircle, Loader2, X, 
  Layers, FileText, Mic, Volume2, ImageIcon, Headphones 
} from 'lucide-react';

const AdminSpokenBatchManager = () => {
  const [activeTab, setActiveTab] = useState('THEORY'); // THEORY, PRACTICE, TEST
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleDetail, setModuleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Forms
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '', section_type: 'THEORY', order: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    content_type: 'WORD',
    title: '',
    text_content: '',
    order: 1
  });
  const [referenceAudioFile, setReferenceAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const fileInputRef = useRef();
  const imageInputRef = useRef();

  useEffect(() => {
    fetchModules(activeTab);
    setSelectedModule(null);
    setModuleDetail(null);
  }, [activeTab]);

  const fetchModules = async (sectionType) => {
    setLoading(true);
    try {
      const data = await adminService.getSpokenModules(sectionType);
      setModules(data);
    } catch (err) {
      setError('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await adminService.getSpokenModuleDetail(id);
      setModuleDetail(data);
    } catch (err) {
      setError('Failed to fetch module details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleModuleClick = (mod) => {
    setSelectedModule(mod);
    fetchModuleDetail(mod.id);
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createSpokenModule({ ...moduleFormData, section_type: activeTab });
      setShowModuleForm(false);
      setModuleFormData({ title: '', description: '', section_type: activeTab, order: modules.length + 1 });
      fetchModules(activeTab);
    } catch (err) {
      alert('Failed to create module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch? All items inside will be lost.')) return;
    try {
      await adminService.deleteSpokenModule(id);
      if (selectedModule?.id === id) {
        setSelectedModule(null);
        setModuleDetail(null);
      }
      fetchModules(activeTab);
    } catch (err) {
      alert('Failed to delete module');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('content_type', itemFormData.content_type);
    formData.append('title', itemFormData.title);
    formData.append('text_content', itemFormData.text_content);
    formData.append('order', itemFormData.order);
    
    if (referenceAudioFile) {
      formData.append('reference_audio', referenceAudioFile);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingItem) {
        await adminService.updateModuleItem(selectedModule.id, editingItem.id, formData);
      } else {
        await adminService.addModuleItem(selectedModule.id, formData);
      }
      
      setShowItemForm(false);
      setEditingItem(null);
      resetItemForm();
      fetchModuleDetail(selectedModule.id);
      fetchModules(activeTab); // To update count
    } catch (err) {
      alert('Failed to save content item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await adminService.deleteModuleItem(selectedModule.id, itemId);
      fetchModuleDetail(selectedModule.id);
      fetchModules(activeTab);
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const openAddItem = () => {
    setEditingItem(null);
    resetItemForm();
    setShowItemForm(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      content_type: item.content_type,
      title: item.title,
      text_content: item.text_content,
      order: item.order
    });
    setReferenceAudioFile(null);
    setImageFile(null);
    setShowItemForm(true);
  };

  const resetItemForm = () => {
    setItemFormData({
      content_type: 'WORD',
      title: '',
      text_content: '',
      order: moduleDetail?.items?.length ? moduleDetail.items.length + 1 : 1
    });
    setReferenceAudioFile(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex px-4" aria-label="Tabs">
            {['THEORY', 'PRACTICE', 'TEST'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? tab === 'THEORY' ? 'border-amber-500 text-amber-600' : 
                      tab === 'PRACTICE' ? 'border-emerald-500 text-emerald-600' : 
                      'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()} Batches
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'THEORY' ? 'Theory (Read + Listen)' :
               activeTab === 'PRACTICE' ? 'Practice (Read + Listen + Record)' :
               'Test (Read + Record)'}
            </h2>
            <button
              onClick={() => {
                setShowModuleForm(true);
                setModuleFormData({ ...moduleFormData, section_type: activeTab, order: modules.length + 1 });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Batch
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
          ) : modules.length === 0 ? (
            <div className="text-center p-8 text-slate-500">No batches created yet for this section.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((mod) => (
                <div 
                  key={mod.id} 
                  className={`border rounded-xl p-5 cursor-pointer transition-all ${selectedModule?.id === mod.id ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                  onClick={() => handleModuleClick(mod)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 truncate" title={mod.title}>{mod.title}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">{mod.description || 'No description'}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Layers className="w-3.5 h-3.5" />
                      {mod.items_count || 0} items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedModule && moduleDetail && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{moduleDetail.title} - Items</h3>
              <p className="text-sm text-slate-500 mt-1">{moduleDetail.description}</p>
            </div>
            <button
              onClick={openAddItem}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                activeTab === 'THEORY' ? 'bg-amber-600 hover:bg-amber-700' :
                activeTab === 'PRACTICE' ? 'bg-emerald-600 hover:bg-emerald-700' :
                'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === 'TEST' ? 'Question' : 'Content'}
            </button>
          </div>

          <div className="p-6">
            {loadingDetail ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : !moduleDetail.items || moduleDetail.items.length === 0 ? (
              <div className="text-center p-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No items added to this batch yet.</p>
                <button onClick={openAddItem} className="mt-4 text-indigo-600 font-medium hover:underline">
                  Add your first item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {moduleDetail.items.sort((a, b) => a.order - b.order).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                        {item.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {item.content_type}
                          </span>
                          <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 truncate mt-1">{item.text_content}</p>
                      </div>
                      <div className="flex items-center gap-3 px-4 shrink-0">
                        {item.reference_audio_url && <Volume2 className="w-4 h-4 text-emerald-500" title="Has Audio" />}
                        {item.image_url && <ImageIcon className="w-4 h-4 text-indigo-500" title="Has Image" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 border-l border-slate-200 pl-4 ml-4">
                      <button onClick={() => openEditItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Create New Batch</h3>
              <button onClick={() => setShowModuleForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateModule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Title</label>
                <input 
                  type="text" required
                  value={moduleFormData.title} onChange={e => setModuleFormData({...moduleFormData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={moduleFormData.description} onChange={e => setModuleFormData({...moduleFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                <input 
                  type="number" required min="1"
                  value={moduleFormData.order} onChange={e => setModuleFormData({...moduleFormData, order: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModuleForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowItemForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="itemForm" onSubmit={handleSaveItem} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                    <select 
                      value={itemFormData.content_type} onChange={e => setItemFormData({...itemFormData, content_type: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
                    >
                      <option value="WORD">Word</option>
                      <option value="SENTENCE">Sentence</option>
                      <option value="PARAGRAPH">Paragraph</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order Sequence</label>
                    <input 
                      type="number" required min="1"
                      value={itemFormData.order} onChange={e => setItemFormData({...itemFormData, order: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" required placeholder="e.g., Hello, Apple, How are you?"
                    value={itemFormData.title} onChange={e => setItemFormData({...itemFormData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Text Content (The actual text to read)</label>
                  <textarea 
                    required placeholder="Enter the exact text the student needs to read or practice"
                    value={itemFormData.text_content} onChange={e => setItemFormData({...itemFormData, text_content: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 h-24 resize-none"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-semibold text-slate-800 text-sm">Media Files (Optional)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Reference Audio (mp3/wav)
                    </label>
                    <input 
                      type="file" accept="audio/*" ref={fileInputRef}
                      onChange={e => setReferenceAudioFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {editingItem?.reference_audio_url && !referenceAudioFile && (
                      <p className="text-xs text-emerald-600 mt-2">Current audio file exists. Upload new to replace.</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Image (png/jpg)
                    </label>
                    <input 
                      type="file" accept="image/*" ref={imageInputRef}
                      onChange={e => setImageFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {editingItem?.image_url && !imageFile && (
                      <p className="text-xs text-indigo-600 mt-2">Current image file exists. Upload new to replace.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
              <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
              <button type="submit" form="itemForm" disabled={isSubmitting} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-70 flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpokenBatchManager;
