'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setUpdating(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        preferred_language: profile.preferred_language,
        avatar_url: profile.avatar_url
      })
      .eq('id', profile.id)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Profile updated successfully!')
    }
    setUpdating(false)
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      {profile && (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <Input
              value={profile.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <Input
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <Input
              value={profile.avatar_url || ''}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
             <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={profile.preferred_language || 'ja'}
              onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
            >
              <option value="ja">Japanese</option>
              <option value="en">English</option>
            </select>
          </div>
          
          {message && <div className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</div>}

          <Button type="submit" disabled={updating}>
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      )}
    </div>
  )
}
