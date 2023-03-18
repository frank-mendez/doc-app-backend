import { getDb } from '../migrations-utils/db'

export const up = async () => {
  const db = await getDb()
  /*
      Code your update script here!
   */
  return db
}

export const down = async () => {
  const db = await getDb()
  /*
      Code you downgrade script here!
   */
  return db
}
