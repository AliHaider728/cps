import React, { useState } from "react";
import { Link } from "wouter";
import { useListClients, useCreateClient } from "../lib/api.js";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Search, Plus, Building2, Phone, Mail, ChevronRight } from "lucide-react";
import { formatSmartDate, getInitials } from "../lib/utils.js";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useListClients({ search });
  const clients = data?.clients || [];
  const { mutate: createClient, isPending: isCreating } = useCreateClient();

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createClient(
      { data: { name: fd.get("name"), pcnNumber: fd.get("pcnNumber"), surgeryName: fd.get("surgeryName"), email: fd.get("email"), phone: fd.get("phone") } },
      { onSuccess: () => setModalOpen(false) }
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients & Surgeries</h1>
          <p className="text-slate-500 mt-1">Manage accounts and track communication history.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-5 h-5" /> Add Client
        </Button>
      </div>

      <Card className="overflow-hidden border-t-4 border-t-blue-600">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by name, PCN, or email..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="text-sm font-medium text-slate-500">{clients.length} Total Accounts</div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Spinner className="w-8 h-8" /></div>
          ) : clients.length === 0 ? (
            <div className="p-16 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No clients found</h3>
              <p className="text-slate-500">Add a new client to start tracking emails.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Client Name & PCN</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Account Manager</th>
                  <th className="px-6 py-4 font-semibold">Last Contacted</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{client.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge color="default">{client.pcnNumber}</Badge>
                            <span className="text-xs text-slate-500">{client.surgeryName}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.email && <div className="flex items-center text-sm text-slate-600"><Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />{client.email}</div>}
                        {client.phone && <div className="flex items-center text-sm text-slate-600"><Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />{client.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.accountManagerName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-600">
                            {getInitials(client.accountManagerName)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{client.accountManagerName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.lastContactedAt ? (
                        <div>
                          <p className="text-sm text-slate-900 font-medium">{formatSmartDate(client.lastContactedAt)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{client.emailCount || 0} emails logged</p>
                        </div>
                      ) : <span className="text-sm text-slate-400">Never</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/clients/${client.id}`}>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Client">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Client Name *</label>
            <Input name="name" required placeholder="e.g. North London Health" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">PCN Number *</label>
            <Input name="pcnNumber" required placeholder="e.g. PCN-12345" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Surgery Name</label>
            <Input name="surgeryName" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input type="email" name="email" placeholder="contact@surgery.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <Input name="phone" placeholder="+44..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create Client</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}