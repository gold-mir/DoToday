export interface Task {
    id: number,
    name: string,
    description?: string,
    // type: FixedDate | DoSoon,
    taskType: TaskTypes,
    completed: boolean,
    date: Date,
    timescale?: number,
    doBefore?: boolean
}

export type TaskTypes = 'FixedDate' | 'DoSoon'

export function generateDailyTasks(tasks: Task[], count: number) {
    let dailyTasks: Task[]

    dailyTasks = tasks.filter((task) => !task.completed)

    return dailyTasks
}