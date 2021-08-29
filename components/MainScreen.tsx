import React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import TaskDB from '../resources/TaskDB'
import { Task } from '../resources/task'

const db = TaskDB.getConnection()

function MainScreen(): JSX.Element {

    const [tasks, setTasks] = useState<Task[]>([])

    const loadTasks = async ()=> {
        let tasks: Task[] = await db.getAllTasks()
        console.log(`printing ${tasks.length} tasks`)
        setTasks(tasks)
    }

    useEffect(() => {
        loadTasks()
    }, [])

    return(
        <View style={styles.container}>
            {tasks.map((task, index) => <Text key={index}>{task.name}</Text>)}
        </View>
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

export default MainScreen