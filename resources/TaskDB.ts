import * as SQLite from 'expo-sqlite'
import { SQLResultSet, WebSQLDatabase } from 'expo-sqlite'

import { Task, TaskTypes } from './task'

const db: WebSQLDatabase = SQLite.openDatabase('doTodayApp')

//db rows: id, name, description, type, date, doBefore, timescale, completed 
async function init(): Promise<TaskDB>  {
    let tdb = new TaskDB(db)
    await tdb.executeSQLAsync('DROP TABLE tasks')
    let setupString = 'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, type TEXT NOT NULL, date TEXT NOT NULL, doBefore NUMBER, timescale NUMBER, completed NUMBER)'
    await tdb.executeSQLAsync(setupString)
    return tdb
}

class TaskDB {
    private db: WebSQLDatabase
    constructor(db: WebSQLDatabase) {
        this.db = db
    }

    async addTask(task: Task): Promise<number> {

        let query = 'INSERT INTO tasks (name, type, date) VALUES (?, ?, ?)'
        let result = await this.executeSQLAsync(query, [task.name, task.taskType, task.date.toISOString()])
        console.log(`created new task with id ${result.insertId}`)

        return result.insertId
    }

    async getTask(id: number): Promise<Task | null> {

        interface taskRows {
            id: number,
            name: string,
            description: string,
            type: string,
            date: string,
            doBefore: number,
            timescale: number,
            string: number,
            completed: number
        }

        let query = `SELECT * FROM tasks WHERE id = ${id}`
        let result = await this.executeSQLAsync(query)
        
        let output: taskRows = (result.rows as any)._array[0]

        let task: Task = {
            id: output.id,
            name: output.name,
            description: output.description,
            taskType: output.type as TaskTypes,
            date: new Date(Date.parse(output.date)),
            doBefore: output.doBefore ? true: false,
            timescale: output.timescale,
            completed: output.completed? true : false
        }

        return task
    }

    async executeSQLAsync(sql: string, params: any[] = []): Promise<SQLResultSet> {
        return new Promise((resolve, reject) => {
            // console.log('im a promise')
            this.db.transaction((tx) => {
                // console.log('im in the transaction')
                tx.executeSql(sql, params, (transaction, results) => {
                    resolve(results)
                }, (transaction, error) => {
                    reject(error)
                    return false
                })
            })
        })
    }
}

export default { init: init}