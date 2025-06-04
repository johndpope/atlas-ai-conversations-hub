// Apis.tsx
import Dexie, { Table } from 'dexie'

interface Memoria {
  id?: number
  usuario: string
  mensagem: string
  resposta: string
  timestamp?: Date
}

class AppDatabase extends Dexie {
  memoria!: Table<Memoria, number>

  constructor() {
    super('memoriaDB')
    this.version(1).stores({
      memoria: '++id, usuario, timestamp'
    })
  }
}

const db = new AppDatabase()

export class Api {
  constructor() {}

  // Salvar mensagem no banco
  static async salvarMemoria(usuario: string, mensagem: string, resposta: string): Promise<void> {
    await db.memoria.add({
      usuario,
      mensagem,
      resposta,
      timestamp: new Date()
    })
  }

  // Recuperar últimas mensagens
  static async recuperarMemoria(usuario: string, limite = 10): Promise<Omit<Memoria, 'id'>[]> {
    const rows = await db.memoria
      .where('usuario')
      .equals(usuario)
      .reverse()
      .sortBy('timestamp')

    return rows.slice(0, limite).reverse()
  }
}
