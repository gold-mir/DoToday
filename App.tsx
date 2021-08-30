import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, View, Button } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import TaskDB from './resources/TaskDB'
import { Task, generateDailyTasks } from './resources/task'

import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'

import TaskListScreen from './components/TaskListScreen'
import TaskEntryScreen from './components/TaskEntryScreen'
import TaskManagerScreen from './components/TaskManagerScreen'

import { StorageKeys, getTomorrow, storeNewDailyTasks, setupBackgroundTasks } from './resources/backgroundTasks'


const db = TaskDB.getConnection()
const Drawer = createDrawerNavigator()

interface State {
  tasks: Task[]
  dailyTasks: Task[]
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

setupBackgroundTasks()

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
    // console.log(dailyTaskIds)

    if(!dailyTaskIds || !lastDate || lastDate < now) {
      dailyTasks = generateDailyTasks(tasks, 5)
      storeNewDailyTasks(dailyTasks)
      AsyncStorage.setItem(StorageKeys.nextNewListDate, JSON.stringify(getTomorrow(now)))
    } else {
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
  }
})
export default App;
