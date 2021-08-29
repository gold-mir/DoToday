import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Notifications from 'expo-notifications'
import * as SQLite from 'expo-sqlite'
import Checkbox from 'expo-checkbox'
import TaskDB from './resources/TaskDB'
import { Task } from './resources/task'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'

import MainScreen from './components/MainScreen'

const db = TaskDB.getConnection()

async function testDB() {
  let dummyTasks: Task[] =[
    {
      name: "Cuddle Wife",
      taskType: 'DoSoon',
      date: new Date(Date.now())
    },
    {
      name: "Kiss Wife",
      taskType: 'FixedDate',
      date: new Date(Date.now() + 1000*60*60*24)
    },
    {
      name: "Squish Wife",
      taskType: 'DoSoon',
      date: new Date(Date.now())
    }
  ]

  await db.addTask({name: "Hold Wife", taskType: "FixedDate", date: new Date(Date.now())})

  dummyTasks.map(async (task) => {
    await db.addTask(task)
  })

  let tasks = await db.getAllTasks()
  console.log(`have ${tasks.length} total tasks, with names ${tasks.map( task => task.name)}`)
}

// testDB()


// export type RootStackParamList = {
//   DoToday: undefined,
//   Second: undefined
// }

// export type NavigatorProp = NativeStackNavigationProp<RootStackParamList>

// const Stack = createNativeStackNavigator<RootStackParamList>()
const Drawer = createDrawerNavigator()

function App (): JSX.Element | null {
  return(
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Tasks" drawerContent={(props) => {
        let { descriptors, navigation, state } = props
        return(
          <DrawerContentScrollView {...props} style={{flex: 1}}>
            <View style={{borderStyle: 'solid', borderColor: 'black', borderWidth: 1, flexGrow: 1}}>
              <DrawerItemList {...props}/>
            </View>
            <View style={{flexBasis: 80, justifyContent: 'center', alignItems: 'center'}}>
              <Text>I love my wife!</Text>
            </View>
          </DrawerContentScrollView>
        )
      }} >
        <Drawer.Screen name="Tasks" component={MainScreen}/>
        <Drawer.Screen name="Second" component={SecondScreen}/>
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

function SecondScreen(): JSX.Element {
  return(
    <View style={styles.container}>
      <Text>
        This is a second screen.
      </Text>
    </View>
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
