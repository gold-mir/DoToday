import React, { Fragment } from 'react'
import { useState } from 'react'
import { Modal, StyleSheet, TouchableWithoutFeedback, View, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native'
import { Task, TaskTypes } from '../resources/task'
import DateTimePicker from '@react-native-community/datetimepicker'
import Checkbox from 'expo-checkbox'

interface Props {
    visible: boolean,
    dismiss: () => void
    submit: (task: Task) => void
}

function TaskEntryScreen(props: Props): JSX.Element {

    let { visible, dismiss, submit } = props

    let [name, setName] = useState('')
    let [type, setType] = useState<TaskTypes>('DoSoon')
    let [date, setDate] = useState(new Date(new Date().setHours(0,0,0,0)))
    let [doBefore, setDoBefore] = useState(false)
    let [timescale, setTimescale] = useState(7)

    let [showDatePicker, setShowDatePicker] = useState(false)

    const resetState = () => {
        setName('')
        setType('DoSoon')
        setDate(new Date(new Date().setHours(0,0,0,0)))
        setDoBefore(false)
        setTimescale(7)
    }

    const onClose = () => {
        resetState()
        dismiss()
    }

    const onSubmit = () => {
        if(name === '') {
            return
        }

        let newTaskDate: Date = new Date(new Date().setHours(0,0,0,0))

        if(type === 'DoSoon'){
            newTaskDate.setDate(newTaskDate.getDate() + timescale)
        } else {
            newTaskDate = new Date(date)
        }

        let newTask: Task = {
            id: -1,
            name: name,
            taskType: type,
            doBefore: doBefore,
            timescale: timescale,
            completed: false,
            date: newTaskDate
        }
        onClose()
        submit(newTask)
    }

    const typeButtonStyle = (buttonType: TaskTypes) => {
        return buttonType === type ? { backgroundColor: 'white', borderWidth: 1 } : { backgroundColor: 'lightgray' }
    }

    const fixedDateSettings = (
        <Fragment>
            <TouchableOpacity activeOpacity={0.7} style={{flexDirection: 'row'}} onPress={() => setShowDatePicker(true)}>
                <Text style={{fontSize: 20}}>Do By </Text>
                <Text style={{fontSize: 20, color: 'blue', textDecorationLine: 'underline'}}>{`${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`}</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                <Text style={{fontSize: 16}}>Can be completed early </Text>
                <Checkbox value={doBefore} onValueChange={setDoBefore} />
            </View>
        </Fragment>
    )

    const doSoonSettings = (
        <Fragment>
            <Text style={{fontSize: 20}}>Timescale</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
                <Text style={{fontSize: 16}}>Urgent</Text>
                <Checkbox value={timescale === 2} onValueChange={() => setTimescale(2)} />
                <Text style={{fontSize: 16}}>Sooner</Text>
                <Checkbox value={timescale === 7} onValueChange={() => setTimescale(7)} />
                <Text style={{fontSize: 16}}>Later</Text>
                <Checkbox value={timescale === 14} onValueChange={() => setTimescale(14)} />
            </View>
        </Fragment>
    )

    return (
    <Modal animationType='fade'
    transparent={true}
    visible={visible}
    onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}/>
        </TouchableWithoutFeedback>
        
        <View style={styles.modal}>
            <View style={styles.entryScreenInternal}>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Add New Task</Text>

                <TextInput placeholder='Name' maxLength={30} onChangeText={setName} style={{fontSize: 20, borderBottomWidth: 1, marginTop: 30}}/>

                <View style={{flexDirection: 'row', marginTop: 30}}>
                    <TouchableOpacity style={{...styles.typeSelectButton, ...typeButtonStyle('DoSoon')}}
                    activeOpacity={0.7}
                    onPress={() => setType('DoSoon')}>
                        <Text style={{fontSize: 25}}>Do Soon</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{...styles.typeSelectButton, ...typeButtonStyle('FixedDate')}}
                    activeOpacity={0.7}
                    onPress={() => setType('FixedDate')}>
                        <Text style={{fontSize: 25}}>Do By Date</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.typeSettingsView}>
                    {type === 'DoSoon'? doSoonSettings : fixedDateSettings}
                </View>

                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={styles.bottomButton} activeOpacity={0.7} onPress={onClose}>
                        <Text style={{fontSize: 25}}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomButton} activeOpacity={0.7} onPress={onSubmit}>
                        <Text style={{fontSize: 25}}>Save</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && <DateTimePicker
                    value={date}
                    mode='date'
                    onChange={(event: any, date: Date | undefined) => {
                        console.log('changed')
                        setShowDatePicker(false)
                        if(date) {
                            setDate(date)
                        }
                    }}
                    minimumDate={new Date(Date.now())}
                />}
            </View>
        </View>

    </Modal>
    )
} 

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
      },
    modal: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        margin: 30,
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 15
    },
    entryScreenInternal: {
        flex: 1,
        width: '100%',
        // backgroundColor: 'aliceblue'
    },
    typeSelectButton: {
        alignItems: 'center',
        flex: 1
    },
    typeSettingsView: {
        alignItems: 'center',
        paddingTop: 30,
        backgroundColor: 'aliceblue',
        flexGrow: 1
    },
    bottomButtonContainer: {
        flexDirection: 'row'
    },
    bottomButton: {
        backgroundColor: 'lightgray',
        borderWidth: 2,
        flex: 1,
        alignItems: 'center'
    }
})

export default TaskEntryScreen