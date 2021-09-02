
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, AsyncStorage } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from 'react-native-gradient-buttons';
import { AppContext } from '../context';
import { approveFriendRequest, createFriendRequest, rejectFriendRequest, removeFriendRequest } from '../api/user';
import Toast from 'react-native-root-toast';


export default function friends({ navigation, goBackToHome }) {

    const { _getAlUser, _getUser, allUser, userData } = useContext(AppContext)
    const [user_id, setuser_id] = useState(null)
    useEffect(() => {
        async function fetchMyAPI() {
            const UID = await AsyncStorage.getItem('UID');
            const token = await AsyncStorage.getItem('token');
            if (token) {
                _getAlUser(token)
            }
            if (UID) {
                setuser_id(UID)
            }
        }
        fetchMyAPI()

    }, [])

    const removeCurrentUser = (data) => {
        if (data?.length) {
            const filtered = data?.filter(e => e._id !== user_id && !userData?.request?.some(f => f._id === e._id) && !userData?.friends?.some(f => f._id === e._id))
            return filtered
        } else return []
    }

    const _createFriendRequest = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const body = {
                    user: userData
                }
                const res = await createFriendRequest(id, body, token)
                _getUser(user_id, token)
                _getAlUser(token)
                Toast.show('Request Sent!', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        } catch (error) {
            console.log(error);
            Toast.show(JSON.stringify(error), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }
    }

    const _approveFriendRequest = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const body = {
                    user: userData
                }
                const res = await approveFriendRequest(id, body, token)
                _getUser(user_id, token)
                _getAlUser(token)
                Toast.show('You are now friends!', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        } catch (error) {
            console.log(error);
            Toast.show(JSON.stringify(error), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }
    }

    const _removeFriendRequest = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const body = {
                    user: userData
                }
                const res = await removeFriendRequest(id, body, token)
                _getUser(user_id, token)
                _getAlUser(token)
                Toast.show('Request removed!', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        } catch (error) {
            console.log(error);
            Toast.show(JSON.stringify(error), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }
    }

    const _rejectFriendRequest = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const body = {
                    user: userData
                }
                const res = await rejectFriendRequest(id, body, token)
                _getUser(user_id, token)
                _getAlUser(token)
                Toast.show('Request rejected!', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        } catch (error) {
            console.log(error);
            Toast.show(JSON.stringify(error), {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }
    }


    return (
        <View style={styles.container}>

            <View style={{ marginTop: wp('10%'), padding: 30 }}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ width: '10%', marginTop: 6 }} onPress={() => goBackToHome()}>
                            <Image style={styles.back} source={require('./../image/icon/back.png')} />
                        </TouchableOpacity>
                        <View style={{ width: '70%', marginLeft: 10, marginRight: 10 }}>
                            <View>
                                <Image style={styles.logo} source={require('./../image/icon/friendtext.png')} />
                            </View>
                        </View>
                        <View style={{ width: '10%', marginLeft: 10, marginRight: 10 }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#DDB937', marginTop: 6 }}>{userData?.request?.length}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: wp('0%'), alignContent: 'center', alignItems: 'center' }}>

                        {
                            userData?.request.map((user, index) => (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '30%' }}>
                                        <Image style={styles.profile} source={{ uri: user?.avatar }} />
                                    </View>
                                    <View style={{ width: '70%' }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{user?.fullname}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                                            <View style={{ width: '100%' }}>
                                                <Text style={{ marginTop: 0, color: '#8f92a1', marginLeft: 5 }}>2 mutual friends</Text>
                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <View style={{ width: '50%' }}>
                                                        <GradientButton
                                                            style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                                                            text={"Approve"}
                                                            textStyle={{ fontSize: 17, color: 'white' }}
                                                            gradientBegin="#DDB937"
                                                            gradientEnd="#DDB937"
                                                            gradientDirection="diagonal"
                                                            height={40}
                                                            width={100}
                                                            radius={10}
                                                            impact
                                                            impactStyle='Light'
                                                            onPressAction={() => _approveFriendRequest(user._id)}
                                                        />
                                                    </View>
                                                    <View style={{ width: '50%' }}>
                                                        <GradientButton
                                                            style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                                                            text="Remove"
                                                            textStyle={{ fontSize: 17, color: 'black' }}
                                                            gradientBegin="#f3f3f3"
                                                            gradientEnd="#f3f3f3"
                                                            gradientDirection="diagonal"
                                                            height={40}
                                                            width={100}
                                                            radius={10}
                                                            impact
                                                            impactStyle='Light'
                                                            onPressAction={() => _rejectFriendRequest(user._id)}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }
                        <View style={{ marginVertical: 20 }}>
                            <Text>People you may know</Text>
                        </View>
                        {
                            allUser && removeCurrentUser(allUser).map((user, index) => (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '30%' }}>
                                        <Image style={styles.profile} source={{ uri: user?.avatar }} />
                                    </View>
                                    <View style={{ width: '70%' }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{user?.fullname}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                                            <View style={{ width: '100%' }}>
                                                <Text style={{ marginTop: 0, color: '#8f92a1', marginLeft: 5 }}>2 mutual friends</Text>
                                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                                    <View style={{ width: '50%' }}>
                                                        <GradientButton
                                                            style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                                                            text={user?.request?.includes(user_id) ? "Requested" : "Request"}
                                                            disabled={user?.request?.includes(user_id)}
                                                            textStyle={{ fontSize: 17, color: 'white' }}
                                                            gradientBegin="#DDB937"
                                                            gradientEnd="#DDB937"
                                                            gradientDirection="diagonal"
                                                            height={40}
                                                            width={100}
                                                            radius={10}
                                                            impact
                                                            impactStyle='Light'
                                                            onPressAction={() => _createFriendRequest(user._id)}
                                                        />
                                                    </View>
                                                    {
                                                        user?.request?.includes(user_id) &&
                                                        <View style={{ width: '50%' }}>
                                                            <GradientButton
                                                                style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                                                                text="Remove"
                                                                textStyle={{ fontSize: 17, color: 'black' }}
                                                                gradientBegin="#f3f3f3"
                                                                gradientEnd="#f3f3f3"
                                                                gradientDirection="diagonal"
                                                                height={40}
                                                                width={100}
                                                                radius={10}
                                                                impact
                                                                impactStyle='Light'
                                                                onPressAction={() => _removeFriendRequest(user._id)}
                                                            />
                                                        </View>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }



                        {/* <GradientButton
                            style={{ marginVertical: 8., marginTop: 0, alignSelf: 'center' }}
                            text="See all"
                            textStyle={{ fontSize: 17, color: 'black' }}
                            gradientBegin="#f3f3f3"
                            gradientEnd="#f3f3f3"
                            gradientDirection="diagonal"
                            height={60}
                            width={280}
                            radius={10}
                            impact
                            impactStyle='Light'
                            onPressAction={() => this.props.navigation.navigate('#')}
                        /> */}


                    </View>

                </ScrollView>
            </View>


        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    logo: {
        width: 180,
        height: 20,
        marginBottom: wp('10%'),
        marginTop: 12
    },
    back: {
        width: 30,
        height: 30,
        marginBottom: wp('10%')
    },
    profile: {
        width: 75,
        height: 75,
        marginBottom: wp('10%'),
        marginTop: 10,
    },

});