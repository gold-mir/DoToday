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

import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack'

const db = TaskDB.init()
db.then(async (db) => {
  let dummyTask: Task = {
    name: `Dummy Task ${Math.random()}`,
    taskType: 'DoSoon',
    date: new Date(Date.now()),
    id: 0
  }
  let id = await db.addTask(dummyTask)
  let task = await db.getTask(id)
  console.log(task)
})

export type RootStackParamList = {
  Home: undefined,
  Second: undefined
}

export type NavigatorProp = NativeStackNavigationProp<RootStackParamList>

const Stack = createNativeStackNavigator<RootStackParamList>()

function App (): JSX.Element | null {
  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={MainScreen}/>
        <Stack.Screen name="Second" component={SecondScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

function MainScreen(): JSX.Element {
  const [checked, setChecked] = useState<boolean>(false)
  const navigation = useNavigation<NavigatorProp>()

  return(
    <View style={styles.container}>
      <View style={styles.checkboxContainer}>
        <Text style={{textDecorationLine: `${checked? 'line-through' : 'none'}`,
          color: `${checked? 'lightgrey' : 'black'}`}}>This is an example task!</Text>
        <Checkbox value={checked} onValueChange={setChecked}/>
      </View>
      <Button title="Go to Second Page" onPress={() => navigation.navigate("Second")} />
      <StatusBar style="auto"/>
    </View>
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
    padding: 5
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
