import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import MapView, { Marker, Callout } from "react-native-maps";
import { requestPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../services/socket';

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#fff'
    },
    callout: {
        width: 320
    },
    devName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    devBio: {
        color: '#666',
        marginTop: 5
    },
    devTechs: {
        marginTop: 5
    },
    searchForm: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 2
    },
    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8e4dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    }
})

export default function Main({ navigation }) {

    const [techs, setTechs] = useState('');

    const [devs, setDevs] = useState([]);

    const [lat, setLat] = useState('');

    const [lon, setLon] = useState('');

    const [currentRegion, setCurrentRegion] = useState(null);

    useEffect(() => {
        async function LoadInitialPosition() {
            const { granted } = await requestPermissionsAsync();

            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });
                
                const { latitude, longitude } = coords;

                setLat(latitude);
                setLon(longitude);
             
                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                })
            }
        }

        LoadInitialPosition();
    }, []);

    useEffect(() => {
        subscribeToNewDevs(dev => setDevs([...devs, dev]))
    }, [devs]);

    function setupWebSocket() {
        disconnect();

        const {latitude, longitude} = currentRegion;

        connect(latitude, longitude, techs);
    }

    async function loadDevs() {

        const response = await api.get('/search', {
                params: {
                    latitude: lat,
                    longitude: lon,
                    techs
                }
            });

        let devArray = await response.data.devs;

        setDevs(devArray);

        setupWebSocket();
    }

    function handleRegionChange(region) {
        setCurrentRegion(region);
    }
    
    if(!currentRegion){
        return null;
    }

    return ( 
        <>
        <MapView 
        onRegionChangeComplete={handleRegionChange} 
        initialRegion={currentRegion} 
        style={styles.map}
        >
        {devs.map(dev => (
        <Marker key={dev._id} coordinate={{longitude: dev.location.coordinates[0], latitude: dev.location.coordinates[1]}} >
            <Image style={styles.avatar} source={{ uri: dev.avatar_url }} />
            <Callout onPress={() => {
                navigation.navigate('Profile', { github_username: dev.github_username })
            }}>
                <View style={styles.callout}>
                    <Text style={styles.devName}>{dev.name}</Text>
                    <Text style={styles.devBio}>{dev.biography}</Text>
                    <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
                </View>
            </Callout>
        </Marker>
        ))}
        </MapView>
        <View style={styles.searchForm}>
            <TextInput 
            style={styles.searchInput}
            value={techs}
            onChangeText={setTechs}
            placeholder='Buscar devs por tecnologias...'
            placeholderTextColor="#999"
            autoCapitalize='words'
            autoCorrect={false}
            />
            <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
                <MaterialIcons name='my-location' size={20} color='#fff'></MaterialIcons>
            </TouchableOpacity>
        </View>
        </>
    )
}