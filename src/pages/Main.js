import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import Icon from '@expo/vector-icons/MaterialIcons';

import api from '../services/api';

export default function Main({ navigation }) {
    const [currentRegion, setCurrentRegion] = useState(null);
    const [techs, setTechs] = useState("");
    const [devs, setDevs] = useState([]);

    useEffect(() => {
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync();
            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });

                const { latitude, longitude } = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                })
            }
        }

        loadInitialPosition();
    }, []);

    async function loadDevs() {
        const { latitude, longitude } = currentRegion;
        api.get('/devs', {
            params: {
                latitude,
                longitude,
                techs
            }
        })
        .then(response => setDevs(response.data))
        .catch(error => console.log(error.response));
    }

    function handleRegionChange(region){
        setCurrentRegion(region);
    }

    if (!currentRegion) {
        return null;
    }

    return (
        <>
            <MapView
                initialRegion={currentRegion}
                style={styles.map}
                onRegionChangeComplete={handleRegionChange}
            >
                {
                    devs.map(dev => (
                        <Marker key={dev._id} coordinate={{latitude: dev.location.coordinates[1], longitude: dev.location.coordinates[0]}} >
                            <Image style={styles.avatar} source={{ uri: dev.avatar_url }} />
                            <Callout onPress={() => navigation.navigate('Profile', { github_username: dev.github_username })}>
                                <View style={styles.callout}>
                                    <Text style={styles.devName}>{dev.name}</Text>
                                    <Text style={styles.devBio}>{dev.bio ? dev.bio : "Esse usuário não possuí bio!"}</Text>
                                    <Text style={styles.devTechs}>{dev.techs.join(", ")}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))
                }
            </MapView>
            <KeyboardAvoidingView style={styles.searchForm} keyboardVerticalOffset={90} behavior="padding">
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar devs por techs..."
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onChangeText={setTechs}
                />
                <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
                    <Icon name="my-location" size={20} color="white" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: 'white',
        resizeMode: 'contain'
    },
    callout: {
        width: 260
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
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: 'white',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        elevation: 2
    },
    loadButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#7d40e7',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    }
});