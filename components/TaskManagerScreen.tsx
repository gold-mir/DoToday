import React from 'react'
import { Task } from '../resources/task'

import { View, StyleSheet, Alert, Text, ScrollView } from 'react-native'

interface Props {
    tasks: Task[]
    updateTask: (task: Task) => void
    deleteTask: (task: Task) => void
}

function TaskManagerScreen(props: Props): JSX.Element {

    let { tasks, updateTask, deleteTask } = props

    return(
        <View style={styles.container}>
            <ScrollView>
                {tasks.map((task, index) => 
                <View style={styles.taskListItem} key={index}>
                    <Text style={{fontSize: 20}}>{task.name}</Text>
                </View>
                )}
            </ScrollView>
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
    taskListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10
    }
})

export default TaskManagerScreen