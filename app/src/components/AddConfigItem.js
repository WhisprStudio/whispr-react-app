import * as React from "react";
import { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, TextInput} from 'react-native';
import AddConfig from "../../assets/svg/AddConfig.js";
import EditConfigModal from "./EditConfigModal.js";

export default function AddConfigItem(props) {

    const [editModal, setEditModal] = useState(false);

    return (<View style={{marginLeft: 20, marginRight: 20, marginTop: 5, marginBottom: 5}}>
    <EditConfigModal editModal={editModal} setEditModal={setEditModal} title={props.title}/>
    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <View>
            <Text style={styles.titleAddConfig}>Add Configuration</Text>
        </View>
        <View style={{flexDirection: "row"}}>
        <TouchableOpacity onPress={() => setEditModal(true)}>
            <AddConfig />
        </TouchableOpacity>
        </View>
    </View>
        <View style={styles.line}></View>
    </View>);
}

const styles = {
    line: {
       marginTop: 10,
       marginBottom: 10,
       borderBottomColor: '#AFAFAF',
       borderBottomWidth: 1,
    },
    titleAddConfig: {
        marginLeft: 10,
        fontSize: 17,
        fontFamily: "Barlow-SemiBoldItalic",
        color: "#AFAFAF",
    },
};