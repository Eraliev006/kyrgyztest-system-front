import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAll } from '../api/organizations'
import type { Organization } from '../types'

export const useOrganizationsStore = defineStore('organizations', () => {
  const organizations = ref<Organization[]>([])
  const loaded = ref(false)

  async function fetch() {
    if (loaded.value) return
    const res = await getAll()
    organizations.value = res.data
    loaded.value = true
  }

  function invalidate() {
    loaded.value = false
    organizations.value = []
  }

  return { organizations, fetch, invalidate }
})
