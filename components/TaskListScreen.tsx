import React from 'react'
import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TextInput, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import TaskDB from '../resources/TaskDB'
import { Task } from '../resources/task'
import Checkbox from 'expo-checkbox'

const db = TaskDB.getConnection()

interface Props {
    tasks: Task[]
    updateTask: (task: Task) => void
}

function TaskListScreen(props: Props): JSX.Element {
    let { tasks, updateTask } = props

    const setTaskCompletion = async (task: Task, completion: boolean) => {
        let newTask = {...task, completed: completion}
        updateTask(newTask)
    }

    return(
        <View style={{...styles.container}}>
            <View style={styles.taskListContainer}>
                {tasks.map((task, index) =>
                    <View key={index} style={styles.taskListItem}>
                        <Text style={{...getTextStyle(task.completed), flexGrow: 1, fontSize: 20, marginRight: 10}}>{task.name}</Text>
                        <Checkbox style={{ transform: [{ scaleX: 2 }, { scaleY: 2 }] }} onValueChange={value => setTaskCompletion(task, value)} value={task.completed}/>
                    </View>
                )}
            </View>
        </View>
    )
}

function getTextStyle(completed: boolean) {
    return completed? styles.taskListTextCompleted : styles.taskListTextUncompleted
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  taskListTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'lightgray'
  },
  taskListTextUncompleted: {
    textDecorationLine: 'none',
    color: 'black'
  },
  taskListContainer: {
  }
})

export default TaskListScreen