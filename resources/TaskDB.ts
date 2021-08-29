import * as SQLite from 'expo-sqlite'
import { SQLResultSet, WebSQLDatabase } from 'expo-sqlite'

import { Task, TaskTypes } from './task'

const db: WebSQLDatabase = SQLite.openDatabase('doTodayApp')

//db rows: id, name, description, type, date, doBefore, timescale, completed 
async function init(): Promise<TaskDB>  {
    let tdb = new TaskDB(db)
    await tdb.executeSQLAsync('DROP TABLE IF EXISTS tasks')
    let setupString = 'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, type TEXT NOT NULL, date TEXT NOT NULL, doBefore NUMBER, timescale NUMBER, completed NUMBER)'
    await tdb.executeSQLAsync(setupString)
    return tdb
}

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

function buildTask(obj: taskRows): Task{
    return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        taskType: obj.type as TaskTypes,
        date: new Date(Date.parse(obj.date)),
        doBefore: obj.doBefore ? true: false,
        timescale: obj.timescale,
        completed: obj.completed? true : false
    }
}

class TaskDB {
    private db: WebSQLDatabase
    private initialized: boolean

    constructor(db: WebSQLDatabase) {
        this.db = db
        this.initialized = false
    }

    async init(){
        if(!this.initialized){
            console.log('db not initialized, initializing')
            // await this.executeSQLAsync('DROP TABLE IF EXISTS tasks')
            let setupString = 'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, type TEXT NOT NULL, date TEXT NOT NULL, doBefore NUMBER, timescale NUMBER, completed NUMBER)'
            await this.executeSQLAsync(setupString)
            this.initialized = true
        } else {
            console.log('db already initialized, continuing')
        }
    }

    async addTask(task: Task): Promise<number> {
        await this.init()

        let query = 'INSERT INTO tasks (name, type, date) VALUES (?, ?, ?)'
        let result = await this.executeSQLAsync(query, [task.name, task.taskType, task.date.toISOString()])
        console.log(`created new task with id ${result.insertId}`)

        return result.insertId
    }

    async getTask(id: number): Promise<Task | null> {
        await this.init()

        let query = `SELECT * FROM tasks WHERE id = ${id}`
        let result = await this.executeSQLAsync(query)
        
        let output: taskRows = (result.rows as any)._array[0]

        let task: Task = buildTask(output)

        return task
    }

    async getAllTasks(): Promise<Task[]> {
        await this.init()

        let query = `SELECT * FROM tasks`
        let result = await this.executeSQLAsync(query)

        let rows: taskRows[] = (result.rows as any)._array
        let tasks: Task[] = rows.map((row) => buildTask(row))

        return tasks
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

export default { getConnection: () => new TaskDB(db) }