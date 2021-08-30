import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TaskDB from './TaskDB'
import { generateDailyTasks, Task } from './task'
import * as Permissions from 'expo-permissions'

const BACKGROUND_DAILYTASK_GENERATOR = 'daily-task-generator'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true
    }
  }
})


export const StorageKeys = {
    dailyTasks: 'daily-tasks',
    nextNewListDate: 'next-date'
  }
  
  export async function storeNewDailyTasks(tasks: Task[]): Promise<number[]> {
    let ids: number[] = []
    ids = tasks.map((task) => task.id)
    await AsyncStorage.setItem(StorageKeys.dailyTasks, JSON.stringify(ids))
    return ids
  }
  
  export function getTomorrow(today: Date){
    let tomorrow = new Date(today)
    tomorrow.setHours(0,0,0,0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

export async function setupBackgroundTasks(){

    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)

    if(status !== 'granted'){
        return
    }

    TaskManager.defineTask(BACKGROUND_DAILYTASK_GENERATOR, async () => {
        let currentTime: Date = new Date()
        let nextNewTaskDateString = await AsyncStorage.getItem(StorageKeys.nextNewListDate)
        let nextNewTaskDate = nextNewTaskDateString? JSON.parse(nextNewTaskDateString) : null

        if(!nextNewTaskDate || nextNewTaskDate < currentTime){
            const db = TaskDB.getConnection()
            let tasks: Task[] = await db.getAllTasks()
            let dailyTasks = generateDailyTasks(tasks, 5)
            await storeNewDailyTasks(dailyTasks)
            await AsyncStorage.setItem(StorageKeys.nextNewListDate, JSON.stringify(getTomorrow(currentTime)))

            let notificationBody: string = ''
            for(let task of dailyTasks) {
                notificationBody += `•${task.name}\n`
            }

            Notifications.scheduleNotificationAsync({
                content: {
                    title: "Today's Tasks",
                    body: notificationBody
                },
                trigger: new Date(new Date().setHours(8,0,0,0))
            })

            return BackgroundFetch.Result.NewData
        } else {
            return BackgroundFetch.Result.NoData
        }
    })

    BackgroundFetch.registerTaskAsync(BACKGROUND_DAILYTASK_GENERATOR, {
        minimumInterval: 60*60*8,
        stopOnTerminate: false,
        startOnBoot: true
    })

    console.log('registered background tasks')
}