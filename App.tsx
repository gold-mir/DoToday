import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Modal, Button, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Notifications from 'expo-notifications'
import TaskDB from './resources/TaskDB'
import { Task, generateDailyTasks } from './resources/task'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'

import TaskListScreen from './components/TaskListScreen'
import TaskEntryScreen from './components/TaskEntryScreen'
import TaskManagerScreen from './components/TaskManagerScreen'

const db = TaskDB.getConnection()
const Drawer = createDrawerNavigator()

export const StorageKeys = {
  dailyTasks: 'daily-tasks',
  nextNewListDate: 'next-date'
}

interface State {
  tasks: Task[]
  dailyTasks: Task[]
}

async function storeNewDailyTasks(tasks: Task[]): Promise<number[]> {
  let ids: number[] = []
  ids = tasks.map((task) => task.id)
  await AsyncStorage.setItem(StorageKeys.dailyTasks, JSON.stringify(ids))
  return ids
}

function getDailyTasksFromList(tasks: Task[], ids: number[]): Task[]{
  ids.sort((a, b) => a - b)
  let currentIndex: number = 0
  let output: Task[] = []
  for(let id of ids){
    while(tasks[currentIndex].id !== id) {
      currentIndex++
    }
    output.push(tasks[currentIndex])
  }

  return output
}

function getTomorrow(today: Date){
  let tomorrow = new Date(today)
  tomorrow.setHours(0,0,0,0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

function App (): JSX.Element | null {

  const [taskEntryVisible, setTaskEntryVisible] = useState<boolean>(false)
  const [state, setState] = useState<State>({tasks: [], dailyTasks: []})

  const loadTasks = async () => {
    let tasks: Task[] = await db.getAllTasks()

    let dailyTasks: Task[] = []
    let lastDateString = await AsyncStorage.getItem(StorageKeys.nextNewListDate)
    let dailyTasksString = await AsyncStorage.getItem(StorageKeys.dailyTasks)

    let lastDate: Date = lastDateString? JSON.parse(lastDateString) : null
    let dailyTaskIds: number[] = dailyTasksString? JSON.parse(dailyTasksString) : null
    
    let now = new Date()
    console.log(dailyTaskIds)

    if(!dailyTaskIds || !lastDate || lastDate < now) {
      console.log(`Don't have daily tasks for ${now}, generating`)
      dailyTasks = generateDailyTasks(tasks, 5)
      storeNewDailyTasks(dailyTasks)
      AsyncStorage.setItem(StorageKeys.nextNewListDate, JSON.stringify(getTomorrow(now)))
    } else {
      console.log('have daily tasks, getting')
      dailyTasks = getDailyTasksFromList(tasks, dailyTaskIds)
    }

    setState({tasks: tasks, dailyTasks: dailyTasks})
  }

  const updateTask = async (task: Task) => {
    let newTask = {...task}
    let newTasks = state.tasks.map(oldTask => oldTask.id === newTask.id ? newTask : oldTask)
    let newDailyTasks = state.dailyTasks.map(oldTask => oldTask.id === newTask.id ? newTask : oldTask)
    await db.updateTask(newTask)
    setState({
      tasks: newTasks,
      dailyTasks: newDailyTasks
    })
  }

  const addTask = async (task: Task) => {
    await db.addTask(task)
    setState({...state, tasks: [...state.tasks, task]})
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return(
    <NavigationContainer>

      <TaskEntryScreen visible={taskEntryVisible} submit={addTask} dismiss={() => setTaskEntryVisible(false)} />
      
      <Drawer.Navigator initialRouteName="Tasks" drawerContent={(props) => {
        let { descriptors, navigation, state } = props
        return(
          <DrawerContentScrollView {...props} contentContainerStyle={{flex: 1}}>
            <View style={{flexGrow: 1}}>
              <DrawerItemList {...props}/>
            </View>
            <View style={{flexBasis: 80}}>
              <Button title='Add Task' onPress={() => {
                navigation.closeDrawer()
                setTaskEntryVisible(true)
              }}/>
            </View>
          </DrawerContentScrollView>
        )
      }} >
        <Drawer.Screen name="Tasks" options={{title: "Today's Tasks"}}>
          {() => (<TaskListScreen tasks={state.dailyTasks} updateTask={updateTask}/>)}
        </Drawer.Screen>
        <Drawer.Screen name="Manage" options={{title: "Manage Tasks"}}>
          {() => (<TaskManagerScreen tasks={state.tasks} updateTask={(updateTask)} deleteTask={()=>null}/>)}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    borderColor: 'black',
    borderStyle: 'solid',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  pageContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    flexBasis: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
})

// const BACKGROUND_TASK_TEST = 'background-test'

// Notifications.setNotificationHandler({
//   handleNotification: async () => {
//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: false,
//       shouldSetBadge: true
//     }
//   }
// })

// TaskManager.defineTask(BACKGROUND_TASK_TEST, async () => {

//   console.log('starting background task')

//   let now = new Date(Date.now())
//   let storedJson = await AsyncStorage.getItem('storedText')

//   let storedText = storedJson ? JSON.parse(storedJson) : ''

//   console.log(`did task at ${now}`)

//   Notifications.scheduleNotificationAsync({
//     content: {
//       title: 'Did a background notification!',
//       body: `Current time is ${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${now.getMinutes()} ${now.getHours() < 12? 'AM' : 'PM'}\n
//       Have Stored Text: ${storedText}`
//     },
//     trigger: null
//   })

//   return BackgroundFetch.Result.NewData
// })

// async function registerTaskNew() {
//   let isRegistered: boolean = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_TEST)
//   let registeredTasks: number;

//   if(isRegistered) {
//     await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_TEST)
//     registeredTasks = (await TaskManager.getRegisteredTasksAsync()).length
//     console.log(`unregistered task, ${registeredTasks} total registered tasks`)
//   }
//   await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_TEST, {
//     minimumInterval: 120,
//     stopOnTerminate: false,
//     startOnBoot: true
//   })
//   registeredTasks = (await TaskManager.getRegisteredTasksAsync()).length
//   console.log(`Registered Task. ${registeredTasks} total tasks registered.`)
// }

// async function unregisterTask() {
//   let isRegistered: boolean = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_TEST)
//   if(isRegistered) {
//     await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_TEST)
//     let registeredTasks = (await TaskManager.getRegisteredTasksAsync()).length
//     console.log(`unregistered task, ${registeredTasks} total registered tasks`)
//   } else {
//     console.log('Task not registered.')
//   }
// }

// registerTaskNew()
// unregisterTask()
export default App;
