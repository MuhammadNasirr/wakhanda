
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, AsyncStorage } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppContext } from '../context';


export default function myfriends({ navigation }) {

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



    console.warn('allUser', userData)

    return (
        <View style={styles.container}>

            <View style={{ marginTop: wp('10%'), padding: 30 }}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={{ width: '10%', marginTop: 6 }} onPress={() => navigation.goBack(null)}>
                            <Image style={styles.back} source={require('./../image/icon/back.png')} />
                        </TouchableOpacity>
                        <View style={{ width: '70%', marginLeft: 10, marginRight: 10 }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#000', marginTop: 6 }}>Friends</Text>
                            </View>
                        </View>
                        <View style={{ width: '10%', marginLeft: 10, marginRight: 10 }}>
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#DDB937', marginTop: 6 }}>{userData?.friends?.length}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: wp('0%'), alignContent: 'center', alignItems: 'center' }}>

                        {
                            userData?.friends.map((user, index) => (
                                <View key={index} style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '30%' }}>
                                        <Image style={styles.profile} source={{ uri: user?.avatar }} />
                                    </View>
                                    <View style={{ width: '70%' }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{user?.fullname}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                                            <View style={{ width: '100%' }}>
                                                <Text style={{ marginTop: 0, color: '#8f92a1', marginLeft: 5 }}>2 mutual friends</Text>
                                                {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
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
                                                            onPressAction={() => this.props.navigation.navigate('#')}
                                                        />
                                                    </View>
                                                </View> */}
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