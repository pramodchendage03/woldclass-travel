import { useState } from "react";
import { useContent, SiteData, Destination, BlogPost } from "../context/ContentContext";
import { LayoutDashboard, FileText, MapPin, Settings, Image as ImageIcon, Save, Plus, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { data, updateData, logout, isAdmin } = useContent();
  const [activeTab, setActiveTab] = useState("content");
  const [localData, setLocalData] = useState<SiteData | null>(data);
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

  if (!localData) return null;

  const handleSave = async () => {
    await updateData(localData);
    alert("Changes saved successfully!");
  };

  const updateSettings = (key: string, value: any) => {
    setLocalData({
      ...localData,
      settings: { ...localData.settings, [key]: value }
    });
  };

  const updateHome = (key: string, value: any) => {
    setLocalData({
      ...localData,
      content: {
        ...localData.content,
        home: { ...localData.content.home, [key]: value }
      }
    });
  };

  const addDestination = () => {
    const newDest: Destination = {
      id: Date.now().toString(),
      name: "New Destination",
      description: "Description here",
      price: 0,
      image: "https://picsum.photos/seed/new/800/600",
      type: "Adventure"
    };
    setLocalData({
      ...localData,
      destinations: [...localData.destinations, newDest]
    });
  };

  const removeDestination = (id: string) => {
    setLocalData({
      ...localData,
      destinations: localData.destinations.filter(d => d.id !== id)
    });
  };

  const updateDestination = (id: string, field: keyof Destination, value: any) => {
    setLocalData({
      ...localData,
      destinations: localData.destinations.map(d => d.id === id ? { ...d, [field]: value } : d)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold italic serif text-blue-600">CMS Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "content", icon: LayoutDashboard, label: "Page Content" },
            { id: "destinations", icon: MapPin, label: "Destinations" },
            { id: "blog", icon: FileText, label: "Blog Posts" },
            { id: "settings", icon: Settings, label: "Site Settings" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeTab} Management</h2>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center shadow-sm transition-all"
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </button>
        </header>

        <div className="p-8 max-w-5xl">
          {activeTab === "content" && (
            <div className="space-y-12">
              <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold mb-4">Home Page Hero</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={localData.content.home.heroTitle}
                      onChange={(e) => updateHome("heroTitle", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hero Subtitle</label>
                    <textarea
                      value={localData.content.home.heroSubtitle}
                      onChange={(e) => updateHome("heroSubtitle", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hero Image URL</label>
                    <input
                      type="text"
                      value={localData.content.home.heroImage}
                      onChange={(e) => updateHome("heroImage", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "destinations" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">All Destinations</h3>
                <button onClick={addDestination} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Add New
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {localData.destinations.map(dest => (
                  <div key={dest.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6">
                    <img src={dest.image} className="w-32 h-32 object-cover rounded-xl" />
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <input
                        value={dest.name}
                        onChange={(e) => updateDestination(dest.id, "name", e.target.value)}
                        className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                        placeholder="Name"
                      />
                      <input
                        type="number"
                        value={dest.price}
                        onChange={(e) => updateDestination(dest.id, "price", parseInt(e.target.value))}
                        className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm"
                        placeholder="Price"
                      />
                      <input
                        value={dest.type}
                        onChange={(e) => updateDestination(dest.id, "type", e.target.value)}
                        className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm col-span-2"
                        placeholder="Type (e.g. Beach, Cultural)"
                      />
                      <textarea
                        value={dest.description}
                        onChange={(e) => updateDestination(dest.id, "description", e.target.value)}
                        className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm col-span-2"
                        rows={2}
                        placeholder="Description"
                      />
                    </div>
                    <button onClick={() => removeDestination(dest.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg self-start">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Site Name</label>
                  <input
                    type="text"
                    value={localData.settings.siteName}
                    onChange={(e) => updateSettings("siteName", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localData.settings.primaryColor}
                      onChange={(e) => updateSettings("primaryColor", e.target.value)}
                      className="h-11 w-11 rounded-lg border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={localData.settings.primaryColor}
                      onChange={(e) => updateSettings("primaryColor", e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-400">SEO Management</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={localData.settings.seo.title}
                      onChange={(e) => setLocalData({...localData, settings: {...localData.settings, seo: {...localData.settings.seo, title: e.target.value}}})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                    <textarea
                      value={localData.settings.seo.description}
                      onChange={(e) => setLocalData({...localData, settings: {...localData.settings, seo: {...localData.settings.seo, description: e.target.value}}})}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
