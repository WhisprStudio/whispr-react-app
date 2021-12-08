import React from "react";
import {useEffect, useState} from "react";
import {View, Text, Button, PermissionsAndroid, ScrollView, ActivityIndicator } from "react-native";
import {BleManager} from 'react-native-ble-plx';
import Card from "../../components/Card";
import {Popup} from "../../components/Popup";
import Toast from 'react-native-toast-message';
import {theme} from "../../theme";

async function requestLocationPermission() {
      const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              title: 'Location permission for bluetooth scanning',
              message: 'whatever',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
          },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission for bluetooth scanning granted');
          return true;
      }
}

export const Bluetooth = ({route, navigation}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState();
    const [devices, setDevices] = useState([]);
    let array = [];
    let idList = [];

    const [editModal, setEditModal] = useState(false);
    let manager = null;

    useEffect(() => {
        manager = new BleManager();
    }, [])

    const getServicesAndCharacteristics = (device) => {
        return new Promise((resolve, reject) => {
            device.services().then(services => {
                const characteristics = []
                console.log("ashu_1",services)
                services.forEach((service, i) => {
                    service.characteristics().then(c => {
                        console.log("service.characteristics")
                        characteristics.push(c)
                        console.log(characteristics)
                        if (i === services.length - 1) {
                            const temp = characteristics.reduce(
                                (acc, current) => {
                                    return [...acc, ...current]
                                },
                                []
                            )
                            const dialog = temp.find(
                                characteristic =>
                                    characteristic.isWritableWithoutResponse
                            )
                            if (!dialog) {
                                reject('No writable characteristic')
                            }
                            resolve(dialog)
                        }

                    })
                })
            })
        })
    };

    const scanAndConnect = async () => {
        const permission = requestLocationPermission();
        if (!permission)
            return
        manager.startDeviceScan(null, null, (error, device) => {
            setIsLoading(true);
            if (error) {
                alert("Error in scan=> " + error);
                manager.stopDeviceScan();
            }
            if (device.id && device.name !== "[TV] Samsung 6 Series (32)") {
                if (idList.indexOf(device.id) === -1) {
                    idList.push(device.id)
                    array = [array, <Card id={device.id} key={`key-${device.id}`} onPress={() => {
                        manager.stopDeviceScan();
                            setIsLoading(false);
                            manager.connectToDevice(device.id, {autoConnect:true}).then((device) => {
                                setSelectedDevice(device)
                                (async () => {
                                    const services = await device.discoverAllServicesAndCharacteristics()
                                    const characteristic = await getServicesAndCharacteristics(services)
                                    console.log("characteristic")
                                    console.log(characteristic)
                                    console.log("Discovering services and characteristics",characteristic.uuid);
                                })();
                                if (device.isConnected()) {
                                    setEditModal(true);
                                }
                            }).catch((error)=>{
                                if (device.isConnected()) {
                                    setEditModal(true);
                                    setSelectedDevice(device);
                                } else {
                                    console.log(error)
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Error',
                                        text2: 'Pairing to device failed.',
                                    })
                                }
                            }
                            );
                        }} text={device.name}/>]
                    setDevices(array)
                }
            }
        });
    };

    useEffect(() => {
        console.log(selectedDevice)

    }, [selectedDevice])

    return (
    <View>
        <Popup editModal={editModal} setEditModal={setEditModal} navigation={navigation} device={selectedDevice}/>
        <Text style={styles.text}>FIND YOUR SPEAKER</Text>
        <View style={{width: "100%"}}>
            <View style={{width: "50%", margin: "auto"}}>
                <Button title={"SCAN FOR DEVICES"} color={theme.colors.yellow} onPress={scanAndConnect}/>
            </View>
        </View>
        {isLoading ? <ActivityIndicator size={"large"} color={theme.colors.yellow}/>:
            <Text style={{fontSize: 30}}>{selectedDevice ? selectedDevice.id : "none"}</Text>
        }
            <ScrollView>{devices}</ScrollView>
    </View>
    )
}

const styles = {
    text: {
        width: "100%",
        marginBottom: "15%",
        textAlign: "center",
        marginTop: "15%",
        fontFamily: theme.fonts.primary.normal,
        fontSize: 27,
        color: "#fff",
    }
};
