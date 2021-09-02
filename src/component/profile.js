
import React from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, Dimensions, TouchableOpacity, AsyncStorage, TextPropTypes } from 'react-native';
const { width: WIDTH } = Dimensions.get('window')
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from 'react-native-gradient-buttons';
import { AppContext } from '../context';
import ImageView from "react-native-image-viewing";
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/imageupload';
import { updateUser } from '../api/user';
import Toast from 'react-native-root-toast';

export default class profile extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            Password: '',
            ischecked: false,
        };
    }
    onValueChange() {
        console.log('#')
    }

    _uploadImage = async (type) => {
        const { userData, _getUser } = this.context
        const user_id = await AsyncStorage.getItem("UID")
        const token = await AsyncStorage.getItem('token');
        if (token == '') {

            alert("Please Login First!");
            return;
        }
        this.setState({ loadingImage: true })
        const ipOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
            base64: true
        };
        const response = await ImagePicker.launchImageLibraryAsync(ipOptions);
        if (response.cancelled) {
            console.log('User cancelled image picker');
            this.setState({ loadingImage: false })
            return
        }
        else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
            this.setState({ loadingImage: false })
        }
        else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
            this.setState({ loadingImage: false })
        }
        else {
            const source = { uri: response.uri };
            if (response.name) {
                source["name"] = response.fileName;
            } else {
                var paths = response.uri.split("/");
                source["name"] = paths[paths.length - 1];
            }
            if (response.type) {
                source["type"] = response.type;
            } else {
                /** For react-native-image-picker library doesn't return type in iOS,
                 *  it is necessary to force the type to be an image/jpeg (or whatever you're intended to be).
                */
                if (Platform.OS === "ios") {
                    source["type"] = 'image/jpeg';
                }
            }
            let base64Img = `data:image/jpg;base64,${response.base64}`;
            let data = {
                "file": base64Img,
                "upload_preset": "wvp8gk5c",
            }
            uploadImage(data).then(async r => {
                let data = await r.json()

                this.setState({ loadingImage: false, [type]: data.url })
                let body = null
                if (type === 'bae') {
                    body = {
                        [type]: data.url,
                        fullname: userData?.fullname,
                        avatar: userData?.avatar,
                        cover: userData?.cover,
                        mybest: userData?.mybest
                    }

                }
                if (type === 'avatar') {
                    body = {
                        [type]: data.url,
                        fullname: userData?.fullname,
                        bae: userData?.bae,
                        cover: userData?.cover,
                        mybest: userData?.mybest
                    }
                }
                if (type === 'mybest') {
                    body = {
                        [type]: data.url,
                        fullname: userData?.fullname,
                        avatar: userData?.avatar,
                        cover: userData?.cover,
                        bae: userData?.bae
                    }
                }
                if (type === 'cover') {
                    body = {
                        [type]: data.url,
                        fullname: userData?.fullname,
                        avatar: userData?.avatar,
                        mybest: userData?.mybest,
                        bae: userData?.bae
                    }
                }
                const res = await updateUser(body, token)

                if (user_id && token) {
                    _getUser(user_id, token)
                }
                Toast.show("Image Uploaded", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            }).catch(err => {
                console.log('err', err)
                this.setState({ loadingImage: false })
                Toast.show("Something went wrong!", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            })
        };
    }

    render() {
        const { userData } = this.context
        console.warn('userData', userData);
        return (
            <View style={styles.container}>

                <View style={{ marginTop: wp('10%'), padding: 0 }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={{ flexDirection: 'row', paddingLeft: 30, marginBottom: -15, marginTop: 5 }}>
                            <TouchableOpacity style={{ width: '10%', marginTop: 3 }} onPress={() => this.props.navigation.goBack(null)}>
                                <Image style={styles.back} source={require('./../image/icon/back.png')} />
                            </TouchableOpacity>
                            <View style={{ marginLeft: 10, marginRight: 10 }}>
                                <View>
                                    <Text style={{ fontSize: 24 }}>Profile</Text>
                                    {/* <Image style={styles.logo} source={require('./../image/icon/verificationtext.png')} /> */}
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: wp('0%'), alignContent: 'center', alignItems: 'center' }}>

                            <TouchableOpacity style={{ width: '100%', height: 200 }} onPress={() => this._uploadImage('cover')}>
                                <ImageBackground source={{ uri: userData?.cover }} style={{ width: '100%', height: 200 }} />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                                <View style={{ width: '30%' }}>
                                    <TouchableOpacity onPress={() => this._uploadImage('bae')}>
                                        <Image style={{ width: 80, height: 80, alignSelf: 'center', marginTop: -50, marginRight: 8, borderWidth: 3, borderColor: 'white', borderRadius: 300, }} source={{ uri: userData?.bae }}></Image>
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center', fontSize: 18, color: '#8f92a1' }}>Bae</Text>
                                </View>
                                <View style={{ width: '30%' }}>
                                    <TouchableOpacity onPress={() => this._uploadImage('avatar')}>
                                        <Image style={{ width: 150, height: 150, alignSelf: 'center', marginTop: -100, borderWidth: 3, borderColor: 'white', borderRadius: 300, }} source={{ uri: userData?.avatar }}></Image>
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center', fontSize: 18, color: '#8f92a1' }}>{userData?.fullname}</Text>
                                </View>
                                <View style={{ width: '30%' }}>
                                    <TouchableOpacity onPress={() => this._uploadImage('mybest')}>
                                        <Image style={{ width: 80, height: 80, alignSelf: 'center', marginTop: -50, marginLeft: 8, borderWidth: 3, borderColor: 'white', borderRadius: 300, }} source={{ uri: userData?.mybest }}></Image>
                                    </TouchableOpacity>
                                    <Text style={{ textAlign: 'center', fontSize: 18, color: '#8f92a1' }}>My Best</Text>

                                </View>
                            </View>

                            <View style={{ padding: 30, marginTop: 100, borderTopColor: '#eaeaea', borderTopWidth: 1 }}>
                                <Text style={{ alignSelf: 'center', fontSize: 25, fontWeight: 'bold', color: '#000000' }}>Pas de publication</Text>
                                <Text style={{ alignSelf: 'center', textAlign: 'center', fontSize: 15, color: '#8f92a1', marginTop: 10 }}>Ce profil n'a encore rien publie, les publications apparaitront lol.</Text>
                                <View style={{ width: '100%' }}>
                                    <GradientButton
                                        style={{ marginVertical: 8., marginTop: 20 }}
                                        text="Commence a publier!"
                                        textStyle={{ fontSize: 15, fontWeight: '100', }}
                                        gradientBegin="#DDB937"
                                        gradientEnd="#DDB937"
                                        gradientDirection="diagonal"
                                        height={40}
                                        width={280}
                                        radius={10}
                                        impact
                                        impactStyle='Light'
                                        onPressAction={() => this.props.navigation.navigate('#')}
                                    />
                                </View>
                            </View>

                        </View>

                    </ScrollView>

                </View>


            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    logo: {
        width: 200,
        height: 25,
        marginBottom: wp('10%'),
        marginTop: 5
    },
    imgpicker: {
        width: 290,
        height: 130,
        alignSelf: 'center',
        marginTop: 20
    },
    search: {
        width: 40,
        height: 40,
        marginBottom: wp('10%')
    },
    back: {
        width: 30,
        height: 30,
        marginBottom: wp('10%')
    },
    icon: {
        width: 80,
        height: 100,
        marginBottom: wp('0%'),
        margin: 10,
        alignSelf: 'center',
        marginTop: 10
    },
    block: {
        margin: 5,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 10,
        padding: 10
    },
    profile: {
        width: 70,
        height: 70,
        marginBottom: wp('10%')
    },
    dot: {
        width: 25,
        height: 10,
        marginTop: wp('2%'),
        marginLeft: 5
    },
    commentimg: {
        width: 30,
        height: 30,
        // marginBottom: wp('10%')
    },
    logintext: {
        width: 300,
        height: 130,
        marginBottom: wp('10%'),
        marginTop: wp('10%'),
    },
    headerText: {
        fontSize: 30,
        color: 'white',
        alignSelf: 'center',
    },
    button: {
        marginTop: hp('3%'),
        alignItems: 'center',
        backgroundColor: '#E0C800',
        borderRadius: wp('2%'),
        height: 40,
        marginHorizontal: wp('13%'),
    },
    buttonText: {

        fontSize: 20,
        color: '#000',
        marginTop: hp('1%'),
    },
    signupView: {
        alignItems: 'center',
        marginTop: hp('35%')
    },
    alresdy: {
        fontSize: hp('2.5%'),
        color: '#666666'
    },
    signupText: {
        fontSize: hp('2.5%'),
        marginTop: hp('1%'),
        color: '#00cb9c',
        fontWeight: 'bold'
    },
    firstInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 25,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5
    },
    firstInput1: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 25,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5
    },
    input1: {
        width: WIDTH - 85,
        height: 120,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
    secondInput: {
        flexDirection: 'row',
        marginBottom: 30,
        marginTop: 40,
        borderBottomColor: '#EAEAEAEA',
        borderBottomWidth: 1,
        marginHorizontal: 25
    },
    checkboxcontainer: {
        flexDirection: "row",
        marginTop: wp('5%'),
        marginLeft: wp('5%')
    },
    checkbox: {
        alignSelf: "center",
    },
    input: {
        width: WIDTH - 85,
        height: 40,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
});