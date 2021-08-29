export interface Task {
    id?: number,
    name: string,
    description?: string,
    // type: FixedDate | DoSoon,
    taskType: TaskTypes,
    completed?: boolean,
    date: Date,
    timescale?: number,
    doBefore?: boolean
}

export type TaskTypes = 'FixedDate' | 'DoSoon'

// //tasks that have to be done on or by a specific date
// export interface FixedDate {
//     //date the task should be done on/by
//     date: Date,
//     //whether the task can be completed before the specified date or not
//     doBefore: boolean
// }

// // //tasks that don't 100% have to be completed soon
// // export interface Priority {
// //     //how likely the task should be to be suggested
// //     priority: number,
// //     //whether or not the task should be marked as completed when completed once, or must be manually marked as finished
// //     longTerm: boolean
// // }

// //tasks that have to be done "soon" without a fixed date
// export interface DoSoon {
//     //how urgently the task should be suggested ()
//     timescale: number,
//     //internal date the task will be considered to be required by
//     doBy: Date
// }