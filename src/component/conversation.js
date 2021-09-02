import React from 'react';
import { StyleSheet, TextInput, Text, View, Image, Keyboard, KeyboardAvoidingView, TouchableOpacity, FlatList, AsyncStorage } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { createMessage, getMessages } from '../api/messages';
import Toast from 'react-native-root-toast';
import ImageView from "react-native-image-viewing";
import EmojiSelector from 'react-native-emoji-selector'
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/imageupload';
import moment from 'moment';
import { AppContext } from '../context';
import { Audio, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let recording = null


export default class chat extends React.Component {
    static contextType = AppContext

    constructor(props) {
        super(props);

        this.state = {
            message: '',
            text: '',
            loading: false,
            MYID: '1',
            USERID: '2',
            currentUserID: null,
            chat: [],
            recording: null
        };
    }

    _getMessages = async (e) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token == '') {
                alert("Please Login First!");
                return;
            }
            const id = this.props.navigation.state.params?.user._id
            const res = await getMessages(id, token, 9)
            console.warn('res.data.messages', res.data.messages);
            this.setState({ chat: res.data.messages.reverse() })
        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    timeout = 0;
    Back() {
        clearInterval(this.timeout);
        this.props.navigation.goBack(null)
    }

    downButtonHandler = () => {
        if (this.scrollView !== null) {
            this.scrollView.scrollToEnd !== null && this.scrollView.scrollToEnd({ animated: true });
        }
    };

    componentDidUpdate() {
        this.downButtonHandler();
    }

    componentWillUnmount() {

        this.keyboardDidShowListener?.remove();
        this.keyboardDidHideListener?.remove();
    }


    componentDidMount = async () => {
        const UID = await AsyncStorage.getItem("UID")
        if (UID) {
            this.setState({ currentUserID: UID })
        }
        this._getMessages()
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    showEmojiKeyboard = () => {
        if (this.state.showEmojiKeyboard) {
            this.setState({ showEmojiKeyboard: false })
        } else {
            Keyboard.dismiss()
            this.setState({ showEmojiKeyboard: true })
        }
    };

    _onPhoto = async () => {
        var ipOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
            base64: true
        };
        const response = await ImagePicker.launchImageLibraryAsync(ipOptions);
        if (response.cancelled) {
            console.log('User cancelled image picker');
        }
        else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
        }
        else {
            let base64Img;
            if (response.type === 'video') {
                let fileBase64 = await FileSystem.readAsStringAsync(response.uri, { encoding: 'base64' });
                base64Img = `data:video/mp4;base64,${fileBase64}`;
            } else {
                base64Img = `data:image/jpg;base64,${response.base64}`;
            }
            let data = {
                "file": base64Img,
                "upload_preset": "wvp8gk5c",
            }
            uploadImage(data).then(async r => {
                let data = await r.json()
                const token = await AsyncStorage.getItem('token');
                if (token == '') {
                    alert("Please Login First!");
                    return;
                }
                const UID = await AsyncStorage.getItem('UID');
                const id = this.props.navigation.state.params?.user._id
                const body = {
                    createdAt: new Date(),
                    media: response.type === 'video' ? [{ public_id: data.public_id, videourl: data.url }] : [{ public_id: data.public_id, url: data.url }],
                    recipient: id,
                    sender: UID,
                    text: this.state.text
                }
                const res = await createMessage(body, token)
                this._getMessages()
            }).catch(err => {
                console.log('err', err)
                Toast.show("Something went wrong!", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            })

        };
    }

    _onSend = async () => {
        try {
            if (!this.state.text) {
                return;
            }
            const token = await AsyncStorage.getItem('token');
            if (token == '') {
                alert("Please Login First!");
                return;
            }
            const UID = await AsyncStorage.getItem('UID');
            const id = this.props.navigation.state.params?.user._id
            const body = {
                createdAt: new Date(),
                media: [],
                recipient: id,
                sender: UID,
                text: this.state.text
            }
            const res = await createMessage(body, token)
            this._getMessages()
            this.setState({ text: '' })
        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }
    }

    startRecording = async () => {
        recording = new Audio.Recording();
        this.setState({
            timerDisplay: "00:00",
            timerCnt: 0,
        });
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                allowsRecordingIOS: true,
                staysActiveInBackground: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                shouldDuckAndroid: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                playThroughEarpieceAndroid: false,
            });
            await recording.prepareToRecordAsync({
                android: {
                    extension: ".m4a",
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEGLAYER3
                },
                ios: {
                    extension: ".m4a",
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEGLAYER3,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                    allowsRecordingIOS: true,
                },
            });
            await recording.startAsync();
            this.setState({
                refreshDisabled: true,
                recordDisabled: false,
                playDisabled: true,
            });
            let recInt = setInterval(() => {
                let counter = this.state.timerCnt + 1;
                let mins = parseInt(counter / 60, 10);
                let secs = parseInt(counter % 60, 10);

                mins = mins < 10 ? "0" + mins : mins;
                secs = secs < 10 ? "0" + secs : secs;
                console.log(mins + ":" + secs);
                this.setState({ timerDisplay: mins + ":" + secs, timerCnt: counter });


            }, 1000);
            this.setState({
                recording: recording,
                isRecording: true,
                intTimer: recInt,
            });
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    stopRecording = async (isdelete) => {
        await this.state.recording.stopAndUnloadAsync();
        clearInterval(this.state.intTimer);
        this.setState({
            isRecording: false,
            recording: undefined,
            timerDisplay: "00:00",
            timerCnt: 0,
            refreshDisabled: false,
            recordDisabled: false,
            playDisabled: false,
        });
        if (isdelete === 'delete') {
            return
        }
        const uri = recording.getURI();
        let fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        let base64Aud = `data:audio/mpeg;base64,${fileBase64}`;
        let body = {
            "file": base64Aud,
            "upload_preset": "wvp8gk5c",
        }
        uploadImage(body).then(async r => {
            let data = await r.json()
            const token = await AsyncStorage.getItem('token');
            if (token == '') {
                alert("Please Login First!");
                return;
            }
            const UID = await AsyncStorage.getItem('UID');
            const id = this.props.navigation.state.params?.user._id
            const body = {
                createdAt: new Date(),
                media: [{ public_id: data.public_id, audiourl: data.url }],
                recipient: id,
                sender: UID,
                text: this.state.text
            }
            const res = await createMessage(body, token)
            this._getMessages()
        }).catch(err => {
            console.log('err', err)
            Toast.show("Something went wrong!", {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            })
        })
    }

    playSound = async (uri) => {
        const { sound } = await Audio.Sound.createAsync(
            { uri }
        );
        await sound.playAsync();
    }

    renderDayRow = ({ item }) => {
        const { userData } = this.context
        const messageUser = this.props.navigation.state.params?.user
        if (item?.recipient === this.state.currentUserID) {
            if (item.media.length > 0) {
                if (item.media[0].audiourl) {
                    return (
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '25%' }}>
                                    <Image style={styles.profile} source={{ uri: userData.avatar }} />
                                </View>

                                <View style={{
                                    width: '70%', padding: 10,
                                    shadowColor: "#000",
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.22,
                                    shadowRadius: 2.22,

                                    elevation: 3,
                                }}>

                                    <TouchableOpacity activeOpacity={1} onPress={() => this.playSound(item.media[0].audiourl)}>
                                        <Text>play audio</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )
                }
                else {
                    return (
                        <View style={{ marginTop: 20 }}>

                            <View style={{ flexDirection: 'row' }}>

                                <View style={{ width: '25%' }}>
                                    <Image style={styles.profile} source={{ uri: userData.avatar }} />
                                </View>

                                <View style={{
                                    width: '70%', padding: 10,
                                    shadowColor: "#000",
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.22,
                                    shadowRadius: 2.22,

                                    elevation: 3,
                                }}>

                                    {
                                        item.media[0].videourl ?
                                            <View style={{ height: 150 }}>
                                                <Video
                                                    ref={refs => this.video = refs}
                                                    style={{
                                                        width: '100%', height: 150, padding: 10, zIndex: -1
                                                    }}
                                                    source={{
                                                        uri: item.media[0].videourl
                                                    }}
                                                    useNativeControls={this.state.isFullScreen}
                                                    resizeMode="contain"
                                                    onFullscreenUpdate={status => this.setState({ isFullScreen: status.fullscreenUpdate === 3 ? false : true })}
                                                    isLooping
                                                    onPlaybackStatusUpdate={status => this.setState({ videostatus: status })}
                                                />
                                                <TouchableOpacity onPress={() => {
                                                    this.setState({ isFullScreen: true })
                                                    this.video.presentFullscreenPlayer()
                                                }} style={{ marginTop: -90, width: '100%', alignItems: 'center', zIndex: 3 }}>
                                                    <Image style={{ width: 40, height: 40 }} source={require('./../image/icon/play.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ images: [{ uri: item.media[0].url }], visible: true })}>
                                                <Image style={{
                                                    width: '100%', height: 150, marginLeft: 10,
                                                    shadowColor: "#000",
                                                    shadowColor: "#000",
                                                    shadowOffset: {
                                                        width: 0,
                                                        height: 1,
                                                    },
                                                    shadowOpacity: 0.22,
                                                    shadowRadius: 2.22,

                                                    elevation: 3, borderWidth: 5, padding: 10, borderColor: '#fff', borderBottomRightRadius: 10,
                                                    borderTopRightRadius: 10,
                                                    borderBottomLeftRadius: 10
                                                }} key={item.media[0].url} source={{ uri: item.media[0].url }} />
                                            </TouchableOpacity>
                                    }
                                </View>

                            </View>


                        </View>
                    )
                }
            }
            else {
                return (
                    <View style={{ marginTop: 20 }}>

                        <View style={{ flexDirection: 'row' }}>

                            <View style={{ width: '25%' }}>
                                <Image style={styles.profile} source={{ uri: userData.avatar }} />
                            </View>

                            <View style={{
                                width: '70%', padding: 10,
                                justifyContent: 'center',
                                marginBottom: 10,
                                backgroundColor: '#fff', shadowColor: "#000",
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: 0.22,
                                shadowRadius: 2.22,
                                elevation: 3,
                                borderBottomRightRadius: 10,
                                borderTopRightRadius: 10,
                                borderBottomLeftRadius: 10
                            }}>

                                <Text style={{
                                }}>
                                    {item.text || item.message}
                                </Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12 }}>{moment(item.createdAt).format('LT')}</Text>
                                </View>
                            </View>

                        </View>


                    </View>
                )
            }
        }
        else {
            if (item.media.length > 0) {
                if (item.media[0].audiourl) {
                    return (
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity activeOpacity={1} onPress={() => this.playSound(item.media[0].audiourl)} style={{
                                    width: '65%', padding: 10, backgroundColor: '#C43379', shadowColor: "#000",
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.22,
                                    shadowRadius: 2.22,
                                    borderWidth: 5,
                                    borderColor: '#fff',
                                    borderBottomRightRadius: 10, borderBottomLeftRadius: 10, borderTopLeftRadius: 10,
                                    elevation: 3,
                                    marginLeft: 20,
                                }}>


                                    <Text>play audio</Text>
                                </TouchableOpacity>
                                <View style={{ width: '20%' }}>
                                    <Image style={styles.profile} source={{ uri: messageUser?.avatar }} />
                                </View>

                            </View>
                        </View>
                    )
                }
                else {
                    return (
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flex: 1, flexDirection: 'row' }}>

                                <View style={{
                                    width: '65%', padding: 10, backgroundColor: '#C43379', shadowColor: "#000",
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.22,
                                    shadowRadius: 2.22,
                                    borderWidth: 5,
                                    borderColor: '#fff',
                                    borderBottomRightRadius: 10, borderBottomLeftRadius: 10, borderTopLeftRadius: 10,
                                    elevation: 3,
                                    marginLeft: 20,
                                }}>
                                    {
                                        item.media[0].videourl ?
                                            <View style={{ height: 150 }}>
                                                <Video
                                                    ref={refs => this.video = refs}
                                                    style={{
                                                        width: '100%', height: 150, padding: 10, zIndex: -1
                                                    }}
                                                    source={{
                                                        uri: item.media[0].videourl
                                                    }}
                                                    useNativeControls={this.state.isFullScreen}
                                                    resizeMode="contain"
                                                    onFullscreenUpdate={status => this.setState({ isFullScreen: status.fullscreenUpdate === 3 ? false : true })}
                                                    isLooping
                                                    onPlaybackStatusUpdate={status => this.setState({ videostatus: status })}
                                                />
                                                <TouchableOpacity onPress={() => {
                                                    this.setState({ isFullScreen: true })
                                                    this.video.presentFullscreenPlayer()
                                                }} style={{ marginTop: -90, width: '100%', alignItems: 'center', zIndex: 3 }}>
                                                    <Image style={{ width: 40, height: 40 }} source={require('./../image/icon/play.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            :

                                            <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ images: [{ uri: item.media[0].url }], visible: true })}>
                                                <Image style={{
                                                    width: '100%', height: 150, padding: 10
                                                }} key={item.media[0].url} source={{ uri: item.media[0].url }} />
                                            </TouchableOpacity>
                                    }

                                </View>
                                <View style={{ width: '20%' }}>
                                    <Image style={styles.profile} source={{ uri: messageUser?.avatar }} />
                                </View>

                            </View>
                        </View>

                    )
                }
            }
            else {
                return (
                    <View style={{ marginTop: 20 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>

                            <View style={{ width: '70%', padding: 10, }}>
                                <Text style={{ marginRight: -15, marginLeft: 10, color: 'white', backgroundColor: '#C43379', padding: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }}>
                                    {item.text || item.message}
                                </Text>
                            </View>
                            <View style={{ width: '20%' }}>
                                <Image style={styles.profile} source={{ uri: messageUser?.avatar }} />
                            </View>

                        </View>
                    </View>
                )

            }
        }
    }

    render() {
        const messageUser = this.props.navigation.state.params?.user
        return (
            <View style={styles.container}>

                <View style={{ flexDirection: 'row', borderBottomColor: '#E8E8E8', borderBottomWidth: 1, marginTop: 30 }}>
                    <View style={{ width: '15%' }}>
                        <TouchableOpacity style={{ marginTop: 6 }} onPress={() => this.props.navigation.goBack(null)}>
                            <Image style={styles.back} source={require('./../image/icon/back.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '53%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('conversation')} style={{ marginTop: wp('7%'), alignContent: 'center', alignItems: 'center', paddingLeft: 15, paddingRight: 15, borderBottomColor: '#EAEAEA', borderBottomWidth: 1, paddingBottom: 10 }}>

                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '25%' }}>
                                    <Image style={{
                                        width: 45,
                                        height: 45,
                                        marginTop: 0,
                                        marginLeft: 0,
                                        borderRadius: 300
                                    }} source={{ uri: messageUser?.avatar }} />
                                </View>
                                <View style={{ width: '75%', marginLeft: 10, marginTop: 5 }}>
                                    <Text style={{ fontSize: 13, color: '#DDB937', fontWeight: 'bold' }}>{messageUser?.username}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 3, marginLeft: -5 }}>
                                        <View style={{ width: '100%' }}>
                                            <Text style={{ marginTop: 0, color: '#8f92a1', marginLeft: 5, fontSize: 11 }}>Active Now</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '10%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('#')}>
                            <Image style={styles.search} source={require('./../image/icon/videocall.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '10%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('#')}>
                            <Image style={styles.search} source={require('./../image/icon/call.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '10%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('#')}>
                            <Image style={styles.search} source={require('./../image/icon/cdot.png')} />
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={{ marginTop: 20 }}></View>

                <ScrollView
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this.setState(prevState => ({ ...prevState, listHeight: contentHeight }));
                    }}
                    onLayout={(e) => {
                        const height = e.nativeEvent.layout.height;
                        this.setState(prevState => ({ ...prevState, scrollViewHeight: height }));
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    ref={(ref) => {
                        this.scrollView = ref;
                    }}
                >
                    <FlatList
                        pagingEnabled
                        data={this.state.chat}
                        renderItem={this.renderDayRow}
                        keyExtractor={item => item.id}
                    />
                </ScrollView>

                <View style={{ marginTop: wp('5%'), alignContent: 'center', alignItems: 'center' }}>
                    <KeyboardAvoidingView behavior="padding">

                        <View style={styles.firstInput}>
                            <TouchableOpacity style={{ width: '15%' }}>
                                <Image style={{ width: 28, height: 28, marginLeft: 10, marginTop: 5 }} source={require('./../image/icon/emoji.png')} />
                            </TouchableOpacity>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={'Write a comment'}
                                    value={this.state.text}
                                    onChangeText={text => this.setState({ text })}
                                />
                            </View>
                            {
                                this.state.recording ?
                                    <>
                                        <TouchableOpacity style={{ width: '10%' }} onPress={() => this.stopRecording('delete')}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={require('./../image/icon/set10.png')} />
                                        </TouchableOpacity>
                                        <View style={{ width: '10%' }}>
                                            <Text style={{ height: 25, marginTop: 5, alignSelf: 'center' }}>{this.state.timerDisplay}</Text>
                                        </View>
                                        <TouchableOpacity style={{ width: '10%' }} onPress={() => this.stopRecording()}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={require('./../image/icon/done.png')} />
                                        </TouchableOpacity>
                                    </>
                                    :
                                    <>
                                        <TouchableOpacity style={{ width: '10%' }} onPress={this.startRecording}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={require('./../image/icon/labelmic.png')} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: '10%' }} onPress={() => this._onPhoto()}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={require('./../image/icon/camera.png')} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ width: '10%' }} onPress={() => this._onSend()}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={require('./../image/icon/sendicon.png')} />
                                        </TouchableOpacity>
                                    </>
                            }
                        </View>

                    </KeyboardAvoidingView>
                    {
                        this.state.showEmojiKeyboard &&
                        <View style={{ height: 300 }}>
                            <EmojiSelector showSearchBar={false} onEmojiSelected={emoji => this.setState({ text: this.state.text + emoji })} />
                        </View>
                    }
                </View>
                <ImageView
                    images={this.state.images}
                    imageIndex={0}
                    visible={this.state.visible}
                    onRequestClose={() => this.setState({ visible: false })}
                />
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#7C0003',
        padding: 20,
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row'
    },
    headerText: {
        color: 'white'
    },
    userList: {
        padding: 8,
        backgroundColor: 'white',
        borderBottomColor: '#f1f1f1',
        borderBottomWidth: 1
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5
    },
    country: {
        fontSize: 14
    },
    login: {
        fontSize: 11,
        color: 'gray'
    },
    profile: {
        fontWeight: 'bold',
        marginTop: 5,
        fontSize: 12,
        color: '#7c0003'
    },
    image: {
        width: 55,
        height: 55,
        marginRight: 15,
        borderRadius: 50,
        marginTop: -5
    },
    flag: {
        fontWeight: 'bold',
        width: 23,
        height: 23,
        color: 'white',
        backgroundColor: '#7C0003',
        borderRadius: 50,
        paddingLeft: 7,
        paddingTop: 1,
        marginLeft: wp('30%'),
        marginTop: wp('3%')
    },
    input: {
        width: 150,
        height: 40,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
    back: {
        width: 20,
        height: 20,
        marginBottom: wp('5%'),
        marginLeft: 20,
        marginTop: 30
    },
    firstInput: {
        flexDirection: 'row',
        marginTop: 10,
        marginHorizontal: 25,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        padding: 5,
        width: '100%'
    },
    profile: {
        width: 65,
        height: 65,
        marginTop: 0,
        marginLeft: 20,
        borderRadius: 300
    },
    search: {
        width: 30,
        height: 30,
        marginTop: 35
    },
});