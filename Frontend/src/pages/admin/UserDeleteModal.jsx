import React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Modal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import api from "../../lib/api"

export function UserDeleteModal({ isOpen, onClose, userId, userEmail, userRole, onDeleteSuccess }) {
  const [impactData, setImpactData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    if (isOpen && userId) {
      fetchImpact()
    }
  }, [isOpen, userId])

  const fetchImpact = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users/${userId}/impact`)
      setImpactData(res.data.data)
    } catch (err) {
      console.error("Failed to fetch user impact:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${userId}`)
      onDeleteSuccess()
      onClose()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User Account"
      description="This action is permanent and cannot be undone."
      className="max-w-md"
    >
      <div className="space-y-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm font-medium text-zinc-500">Calculating data impact...</p>
          </div>
        ) : impactData ? (
          <>
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 p-6 border border-red-100 dark:border-red-900/20">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-red-100 dark:bg-red-900/30 p-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-300">Hard Deletion Warning</h4>
                  <p className="text-xs font-medium text-red-700/80 dark:text-red-400/80 leading-relaxed">
                    Deleting <span className="font-bold">{userEmail}</span> will permanently remove the following linked data from the database:
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {userRole === 'creator' ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Joined</span>
                      <p className="text-xl font-black text-red-900 dark:text-red-100">{impactData.stats.joins} Campaigns</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Created</span>
                      <p className="text-xl font-black text-red-900 dark:text-red-100">{impactData.stats.submissions} Submissions</p>
                    </div>
                  </>
                ) : userRole === 'brand' ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Owned</span>
                      <p className="text-xl font-black text-red-900 dark:text-red-100">{impactData.stats.campaigns} Campaigns</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Received</span>
                      <p className="text-xl font-black text-red-900 dark:text-red-100">{impactData.stats.submissions} Submissions</p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <p className="text-sm text-zinc-500 text-center font-medium px-4">
              Are you sure you want to proceed? This will erase all proof of work and campaign analytics associated with this account.
            </p>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold"
                onClick={onClose}
                disabled={deleting}
              >
                Keep Account
              </Button>
              <Button 
                className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/20"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Confirm Delete"}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-zinc-500 py-8">Failed to load user information.</p>
        )}
      </div>
    </Modal>
  )
}
