
import React from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, TouchableOpacity, TextInput, AsyncStorage } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import SendIcon from './../image/icon/sendicon.png';
import moment from 'moment';
import Toast from 'react-native-root-toast';
import { commentPost, getsinglePost, likeComment, unlikeComment } from '../api/post';
import { AppContext } from '../context';
import ImageView from "react-native-image-viewing";
import { Audio, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { uploadImage } from '../api/imageupload';
import * as ImagePicker from 'expo-image-picker';

let recording = null

export default class comments extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            UID: '',
            comments: [],
            ischecked: false,
            recording: null
        };
    }

    async componentDidMount() {
        const UID = await AsyncStorage.getItem('UID');
        this.setState({ UID: UID })
        this._getSinglePost()
    }

    _commentPost = async () => {
        const { content } = this.state
        if (content) {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token == '') {

                    alert("Please Login First!");
                    return;
                }
                const { userData } = this.context
                const post = this.props.navigation.state.params?.post
                const body = {
                    content: content,
                    createdAt: new Date(),
                    likes: [],
                    media: [],
                    postId: post?._id,
                    postUserId: post?.user?._id,
                    user: userData
                }
                const res = await commentPost(body, token)
                this.setState({ content: '' })
                this._getSinglePost()
            } catch (error) {
                console.log(error)
                Toast.show("Something went wrong.", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            }
        }
    }

    _getSinglePost = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token == '') {
                alert("Please Login First!");
                return;
            }
            const post = this.props.navigation.state.params?.post
            const res = await getsinglePost(post?._id, token)
            this.setState({ comments: res.data.post.comments })
        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong...", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    _likeComment = async (id) => {
        const token = await AsyncStorage.getItem('token');
        if (token == "") {
            alert('Please login First.')
            return
        }
        try {
            const res = await likeComment(id, token)
            this._getSinglePost()

        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    _unlikeComment = async (id) => {
        const token = await AsyncStorage.getItem('token');
        if (token == "") {
            alert('Please login First.')
            return
        }
        try {
            const res = await unlikeComment(id, token)
            this._getSinglePost()

        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    checkMyLike = (likes) => {
        if (likes) {
            const { UID } = this.state;
            const myLike = likes?.some(e => e._id === UID)
            return myLike
        } else return false
    }


    startRecording = async () => {
        recording = new Audio.Recording();
        this.setState({
            timerDisplay: "00:00",
            timerCnt: 0,
        });
        try {
            console.log('Requesting permissions..');
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
            console.log('Recording started');
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
            const { userData } = this.context
            const { content } = this.state
            const post = this.props.navigation.state.params?.post
            const body = {
                content: content,
                createdAt: new Date(),
                likes: [],
                media: [{ public_id: data.public_id, audiourl: data.url }],
                postId: post?._id,
                postUserId: post?.user?._id,
                user: userData
            }
            const res = await commentPost(body, token)
            this.setState({ content: '' })
            this._getSinglePost()
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
                const { userData } = this.context
                const { content } = this.state
                const post = this.props.navigation.state.params?.post
                const body = {
                    content: content,
                    createdAt: new Date(),
                    likes: [],
                    media: response.type === 'video' ? [{ public_id: data.public_id, videourl: data.url }] : [{ public_id: data.public_id, url: data.url }],
                    postId: post?._id,
                    postUserId: post?.user?._id,
                    user: userData
                }
                const res = await commentPost(body, token)
                this.setState({ content: '' })
                this._getSinglePost()
            }).catch(err => {
                console.log('err', err)
                Toast.show("Something went wrong!", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            })

        };
    }

    render() {
        const { comments } = this.state
        const post = this.props.navigation.state.params?.post
        return (
            <View style={styles.container}>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'space-between' }}>
                    <View style={{ marginTop: wp('5%'), padding: 30 }}>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={{ width: '10%', marginTop: 6 }} onPress={() => this.props.navigation.goBack(null)}>
                                <Image style={styles.back} source={require('./../image/icon/back.png')} />
                            </TouchableOpacity>
                            <View style={{ width: '45%', marginLeft: 10, marginRight: 10 }}>
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 0 }}>Comments</Text>
                                </View>
                            </View>
                        </View>

                        {
                            comments?.map((comment, index) => (
                                <View key={index} style={{ marginTop: 40 }}>
                                    <View style={{ width: '90%', backgroundColor: '#EAEAEA', padding: 10, borderRadius: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ width: '80%' }}>
                                                <Image style={{ width: 50, height: 50, marginTop: -40, borderWidth: 1, borderColor: "#DDB937", borderRadius: 500 }} source={{ uri: comment?.user?.avatar }} />
                                            </View>
                                            <View style={{ width: '20%', flexDirection: 'row', backgroundColor: '#434248', marginTop: -20, height: 26, borderRadius: 15, padding: 5 }}>
                                                <Image style={{ width: 15, height: 15 }} source={require('./../image/icon/like.png')} />
                                                <Text style={{ color: 'white', fontSize: 12, marginLeft: 5 }}>{comment?.likes?.length}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ marginTop: 10, fontWeight: 'bold', fontSize: 15 }}>{comment?.user?.username}</Text>
                                        <Text style={{ marginTop: 10 }}>{comment?.content}</Text>
                                        {
                                            comment?.media?.length > 0 && comment.media[0].audiourl &&
                                            <TouchableOpacity onPress={() => this.playSound(comment.media[0].audiourl)}>
                                                <Text style={{ marginTop: 10 }}>{"play audio"}</Text>
                                            </TouchableOpacity>
                                        }
                                        {
                                            comment?.media?.length > 0 && comment.media[0].url &&
                                            <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ images: [{ uri: comment.media[0].url }], visible: true })}>
                                                <Image style={{
                                                    width: '100%', height: 150, padding: 10
                                                }} key={comment.media[0].url} source={{ uri: comment.media[0].url }} />
                                            </TouchableOpacity>
                                        }
                                        {
                                            comment?.media?.length > 0 && comment.media[0].videourl &&

                                            <View style={{ height: 150 }}>
                                                <Video
                                                    ref={refs => this.video = refs}
                                                    style={{
                                                        width: '100%', height: 150, padding: 10, zIndex: -1
                                                    }}
                                                    source={{
                                                        uri: comment.media[0].videourl
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
                                        }
                                    </View>

                                    <View style={{ flexDirection: 'row', padding: 10 }}>

                                        <View style={{ width: '30%' }}>
                                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, fontWeight: 'bold' }}>{moment(comment?.createdAt).fromNow()}</Text>
                                        </View>

                                        <TouchableOpacity onPress={() => this.checkMyLike(comment?.likes) ? this._unlikeComment(comment?._id) : this._likeComment(comment?._id)} style={{ width: '20%' }}>
                                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, fontWeight: 'bold' }}>{this.checkMyLike(comment?.likes) ? "Unlike" : "Like"}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('commentreply', { comment: comment, post: post })} style={{ width: '20%' }}>
                                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, fontWeight: 'bold' }}>Reply</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            ))
                        }
                    </View>



                </ScrollView>
                <View style={{ marginTop: wp('5%'), marginBottom: wp('5%'), alignContent: 'center', alignItems: 'center' }}>
                    <KeyboardAvoidingView behavior="padding">

                        <View style={styles.firstInput}>
                            <TouchableOpacity style={{ width: '10%' }}>
                                <Image style={{ width: 28, height: 28, marginLeft: 10, marginTop: 5 }} source={require('./../image/icon/emoji.png')} />
                            </TouchableOpacity>
                            <View style={{ width: '50%' }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={'Write a comment'}
                                    value={this.state.content}
                                    onChangeText={content => this.setState({ content })}
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
                                        <TouchableOpacity onPress={() => this._commentPost()} style={{ width: '10%' }}>
                                            <Image style={{ width: 25, height: 25, marginTop: 5, alignSelf: 'center' }} source={SendIcon} />
                                        </TouchableOpacity>
                                    </>
                            }
                        </View>

                    </KeyboardAvoidingView>
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
        backgroundColor: "white",
    },
    logo: {
        width: 160,
        height: 35,
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
        width: 20,
        height: 20,
        marginBottom: wp('10%')
    },
    icon: {
        width: 40,
        height: 40,
        marginBottom: wp('10%'),
        margin: 10
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
        padding: 5,
        width: '100%'
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
        width: 150,
        height: 40,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: 15
    },
});