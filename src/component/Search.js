import React from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, TextInput, Modal, AsyncStorage, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GradientButton from 'react-native-gradient-buttons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../api/imageupload';
import Toast from 'react-native-root-toast';
import { createPost, deletePost, getPost, likePost, unlikePost, updatePost } from '../api/post';
import { ActivityIndicator } from 'react-native-paper';
import { AppContext } from '../context';
import Loading from './Loading';
import moment from 'moment';
import ImageView from "react-native-image-viewing";
import * as FileSystem from 'expo-file-system';
// import { Storyly } from "storyly-react-native";

import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { Video } from 'expo-av';


export default class Search extends React.Component {
    static contextType = AppContext
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            Password: '',
            ischecked: false,
            images: [],
            imagesFull: [],
            imagesEdit: [],
            group: [
                { id: 1, Image: require('./../image/ad1.jpg') },
                { id: 2, Image: require('./../image/ad2.jpg') },
                { id: 3, Image: require('./../image/ad3.jpg') },
                { id: 4, Image: require('./../image/ad4.jpg') },
                { id: 5, Image: require('./../image/ad1.jpg') },
                { id: 6, Image: require('./../image/ad2.jpg') },
                { id: 7, Image: require('./../image/ad3.jpg') },
                { id: 8, Image: require('./../image/ad4.jpg') },
                { id: 9, Image: require('./../image/ad1.jpg') },
                { id: 10, Image: require('./../image/ad2.jpg') },
            ],
            story: [
                { id: 1, Image: require('./../image/icon/g1.png') },
                { id: 2, Image: require('./../image/icon/g2.png') },
                { id: 3, Image: require('./../image/icon/g3.png') },
                { id: 4, Image: require('./../image/icon/g1.png') },
                { id: 5, Image: require('./../image/icon/g2.png') },
                { id: 6, Image: require('./../image/icon/g3.png') },
                { id: 7, Image: require('./../image/icon/g1.png') },
                { id: 8, Image: require('./../image/icon/g2.png') },
                { id: 9, Image: require('./../image/icon/g3.png') },
                { id: 10, Image: require('./../image/icon/g1.png') },
            ],
            showMe: false,
            loading: false,
            loadingImage: false,
            going: '',
            goingEdit: '',
            postId: '',
            editPost: false,
            readmore: false,
            name: '',
            UID: '',
            PASS: '',
            posts: [],
            reaction: false,
            height: 80
        };
    }

    componentDidMount = async () => {
        const UID = await AsyncStorage.getItem('UID');
        this.setState({ UID: UID })
        this.getPosts();
    }




    renderGroup = ({ item }) => {
        return (
            <TouchableOpacity>
                <Image style={styles.ads} source={item.Image} />
            </TouchableOpacity>
        )
    }

    renderStory = ({ item }) => {
        return (
            <TouchableOpacity>
                <Image style={styles.story} source={item.Image} />
            </TouchableOpacity>
        )
    }

    checkLikePost = (likes) => {
        if (likes) {
            const { UID } = this.state;
            const myLike = likes?.some(e => e._id === UID)
            return myLike
        } else return false
    }

    readMorePost = (index, value) => {
        this.state.posts[index].readmore = value
        this.setState({ posts: this.state.posts })
    }

    renderPosts = ({ item, index }) => {
        return (
            <View>
                <View>
                    <View style={{ padding: 20, flexDirection: 'row' }}>
                        <View style={{ width: '22%' }}>
                            <Image style={{ width: 60, height: 60, borderRadius: 500 }} source={{ uri: item?.user?.avatar }} />
                        </View>
                        <View style={{ width: '70%' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 7 }}>{item?.user?.fullname}</Text>
                            <Text style={{ fontSize: 13, color: '#8f92a1' }}>{moment(item?.createdAt).fromNow()}</Text>
                        </View>
                        <Menu>
                            <MenuTrigger text={<View style={{ transform: [{ rotateZ: '90deg' }] }}><Image style={{ width: 20, height: 50, }} resizeMode={"contain"} source={require("./../image/icon/dots.png")} /></View>} />
                            <MenuOptions>
                                <MenuOption onSelect={() => this.setState({ editPost: true, goingEdit: item?.content, postId: item?._id, imagesEdit: item?.images })} text='Edit' />
                                <MenuOption onSelect={() => this._deletePost(item?._id)} >
                                    <Text style={{ color: 'red' }}>Delete</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </View>
                    <Text style={{ fontSize: 15, color: '#000', marginLeft: 10, marginBottom: 20 }}>{item?.readmore ? item?.content : item?.content?.substring(0, 70)} {(item?.readmore ? <Text onPress={() => this.readMorePost(index, false)}> read less</Text> : !item?.readmore ? item?.content?.length > 70 ? <Text onPress={() => this.readMorePost(index, true)}> ... Read more</Text> : '' : '')}</Text>
                    {
                        item?.images?.length > 0 && item.images[0].url &&
                        <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ imagesFull: [{ uri: item.images[0].url }], visible: true })}>
                            <Image style={{ width: '100%', height: 400, resizeMode: 'cover' }} source={item?.images?.length > 0 ? { uri: item?.images[0].url } : require('./../image/icon/postimg.jpg')} />
                        </TouchableOpacity>
                    }
                    {
                        item?.images?.length > 0 && item.images[0].videourl &&
                        <View style={{ height: 300 }}>
                            <Video
                                ref={refs => this.video = refs}
                                style={{
                                    width: '100%', height: 300, padding: 10, zIndex: -1
                                }}
                                source={{
                                    uri: item.images[0].videourl
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
                            }} style={{ marginTop: -200, width: '100%', alignItems: 'center', zIndex: 3 }}>
                                <Image style={{ width: 40, height: 40 }} source={require('./../image/icon/play.png')} />
                            </TouchableOpacity>
                        </View>
                    }

                    {this.state.reaction == false ?
                        null
                        :
                        <View style={{ backgroundColor: 'white', borderRadius: 50, padding: 10 }}>
                            <View style={{ flexDirection: 'row' }}>

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/strong.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/heart.gif')} />
                                </TouchableOpacity>

                                {/* <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '14.2%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/like.gif')} />
                                </TouchableOpacity> */}

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/laugh.gif')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/cry.gif')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/angry.gif')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this._likePost(item?._id)} style={{ width: '16.6%' }}>
                                    <Image style={{ width: 50, height: 50, alignSelf: 'center' }} source={require('./../image/icon/emoji/amazed.gif')} />
                                </TouchableOpacity>

                            </View>
                        </View>
                    }

                    <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 30, borderTopColor: '#EAEAEA', borderTopWidth: 1, borderBottomColor: '#EAEAEA', borderBottomWidth: 1 }}>

                        <TouchableOpacity onPress={() => this.checkLikePost(item?.likes) ? this._unlikePost(item?._id) : this.setState({ reaction: true })} style={{ width: '25%', flexDirection: 'row' }}>
                            <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={this.checkLikePost(item?.likes) ? require('./../image/icon/filladdetailheart.png') : require('./../image/icon/labelheart.png')} />
                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, alignSelf: 'center' }}>{item?.likes?.length}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('comments', { post: item })} style={{ width: '25%', flexDirection: 'row' }}>
                            <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/labelcomment.png')} />
                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, alignSelf: 'center' }}>{item?.comments?.length}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ width: '25%', flexDirection: 'row' }}>
                            <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/labelmic.png')} />
                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, alignSelf: 'center' }}>0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ width: '25%', flexDirection: 'row' }}>
                            <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                            <Text style={{ fontSize: 13, color: '#9B9B9B', paddingLeft: 10, paddingTop: 4, alignSelf: 'center' }}>0</Text>
                        </TouchableOpacity>

                    </View>

                </View>
                <View style={{ backgroundColor: '#E0E0E0', padding: 5 }}></View>
            </View>
        )
    }

    close() {
        this.setState({ showMe: false })
    }

    getPosts = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token == '') {

            alert("Please Login First!");
            return;
        }
        else {
            try {
                const posts = await getPost(token)
                this.setState({ posts: posts.data.posts })
            } catch (error) {
                console.log(error);
            }
        }

    }

    getUser = async () => {

        const UID = await AsyncStorage.getItem('UID');
        const PASS = await AsyncStorage.getItem('PASS');

        if (UID == '') {

            alert("Please Login First!");
            return;
        }
        else {

            var myHeaders = new Headers();
            myHeaders.append("api_token", "4E/udJsISHSXa5z7Zi871SaOuZ3/6ENptOMnqJDqqA445zt7UyZCD61sl23S4YepbHsb8UDaR+So8IduAXO90A==");
            myHeaders.append("api_secret", "eEO4sxR+Q5uRsRdjdP4snjFWZ0Bu/0cRnXeQjEdJOhSrUol9ffROQ6SifJsDaFK4FFa6/CqkTyuJJORlvpVw5IkcNDzhGk5PlAt72GQyvc2R+qiCuDxMj6qJnXI05D1sGttaz3H/R5KLgdovgfoO5swsNGa8ZEL7lkVWUp/4qPI1XkH0gtNAergUYGw0Uy9O");
            myHeaders.append("X-Ahtapot-Domain", "octo-sandbox");
            myHeaders.append("X-Ahtapot-Timezone", "Europe/Istanbul");
            myHeaders.append("Content-Type", "application/json");

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            fetch(`https://api.ahtapotapp.com/iam/user/${UID}`, requestOptions)
                .then(response => response.text())
                .then((responseJson) => {

                    const obj = JSON.parse(responseJson);
                    // const name = obj.user.first_name +" "+ obj.user.last_name
                    console.log(obj)

                    if (obj) {
                        this.setState({
                            name: obj.user.first_name + " " + obj.user.last_name,
                        })
                    }
                })
                .catch(error => console.log('error', error));
        }

    }

    _likePost = async (id) => {
        const token = await AsyncStorage.getItem('token');
        if (token == "") {
            alert('Please login First.')
            return
        }
        try {
            const res = await likePost(id, token)
            this.getPosts()
            this.setState({ reaction: false })

        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    _unlikePost = async (id) => {
        const token = await AsyncStorage.getItem('token');
        if (token == "") {
            alert('Please login First.')
            return
        }
        try {
            const res = await unlikePost(id, token)
            this.getPosts()
            this.setState({ reaction: false })

        } catch (error) {
            console.log(error)
            Toast.show("Something went wrong.", {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            })
        }

    }

    TextPost = async () => {
        this.setState({
            loading: true
        })
        const { images, going } = this.state
        if (images.length || going) {
            const body = {
                content: going,
                images: images
            }
            const token = await AsyncStorage.getItem("token")
            createPost(body, token)
                .then(res => {
                    this.setState({
                        going: '',
                        images: [],
                        loading: false
                    })
                    this.getPosts();
                    Toast.show("Post added.", {
                        duration: Toast.durations.SHORT,
                        position: Toast.positions.BOTTOM,
                    })
                }).catch(err => {
                    console.log(err)
                    this.setState({
                        loading: false
                    })
                    Toast.show("Something went wrong.", {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                    })
                })
        }
    }

    EditTextPost = async () => {
        this.setState({
            loading: true
        })
        const { imagesEdit, goingEdit, postId } = this.state
        if (imagesEdit.length || goingEdit) {
            const body = {
                content: goingEdit,
                images: imagesEdit
            }
            const token = await AsyncStorage.getItem("token")
            updatePost(postId, body, token)
                .then(res => {
                    this.setState({
                        goingEdit: '',
                        postId: '',
                        editPost: false,
                        imagesEdit: [],
                        loading: false
                    })
                    this.getPosts();
                    Toast.show("Post edited.", {
                        duration: Toast.durations.SHORT,
                        position: Toast.positions.BOTTOM,
                    })
                }).catch(err => {
                    console.log(err)
                    this.setState({
                        loading: false
                    })
                    Toast.show("Something went wrong.", {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                    })
                })
        }
    }

    _deletePost = async (id) => {
        this.setState({
            loading: true
        })
        const { userData } = this.context
        const body = {
            user: userData
        }
        const token = await AsyncStorage.getItem("token")
        deletePost(id, body, token)
            .then(res => {
                this.setState({
                    loading: false
                })
                this.getPosts();
                Toast.show("Post Deleted.", {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                })
            }).catch(err => {
                console.log(err)
                this.setState({
                    loading: false
                })
                Toast.show("Something went wrong.", {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM,
                })
            })
    }

    updateSize = (height) => {
        this.setState({
            height
        });
    }

    _uploadImage = async () => {
        this.setState({ loadingImage: true, showMe: false })
        const ipOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
            base64: true
        };
        const response = await ImagePicker.launchImageLibraryAsync(ipOptions);
        if (response.cancelled) {
            console.log('User cancelled image picker');
            this.setState({ loadingImage: false })
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
                if (this.state.editPost) {
                    this.setState({ loadingImage: false, imagesEdit: response.type === 'video' ? [{ public_id: data.public_id, videourl: data.url }] : [{ public_id: data.public_id, url: data.url }] })
                } else {
                    this.setState({ loadingImage: false, images: response.type === 'video' ? [{ public_id: data.public_id, videourl: data.url }] : [{ public_id: data.public_id, url: data.url }] })
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

    onCloseLoading = () => {
        this.setState({ loading: false })
    }

    render() {
        const { userData } = this.context
        const { navigation } = this.props
        const { loading } = this.state;

        return (
            <View style={styles.container}>
                {/* <Storyly
                    style={{ width: '100%', height: 120 }}
                    storylyId="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NfaWQiOjQxMjksImFwcF9pZCI6Njk3OCwiaW5zX2lkIjo3MjI4fQ.TyS9PVlpk8C7_4xglZvHOU5kTXIdx9IBSEk2W7Wkiuc"
                    onLoad={storyGroupList => {
                        console.log('All stories are loaded now')
                    }}
                    onFail={errorMessage => {
                        console.log('Error loading stories')
                    }}
                    onPress={story => {
                        console.log('The SWIPE UP has been triggered')
                    }}
                    onStoryOpen={e => {
                        console.log('The Story is opened and is been viewed')
                    }}
                    onStoryClose={e => {
                        console.log('The Story is closed')
                    }}
                /> */}

                <View style={{ marginTop: wp('10%') }}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={{ flexDirection: 'row', padding: 30, paddingBottom: 30 }}>
                            <TouchableOpacity onPress={() => navigation.navigate("profile")} style={{ width: '20%' }}>
                                <Image style={styles.profile} source={{ uri: userData?.avatar }} />
                            </TouchableOpacity>
                            <View style={{ width: '40%', marginLeft: 10, marginRight: 10 }}>
                                <Image style={{ width: 130, height: 30, alignSelf: 'center', marginTop: 10 }} source={require('./../image/name.png')} />
                            </View>
                            <View style={{ width: '12%', marginLeft: 10, marginRight: 10 }}>
                                <TouchableOpacity>
                                    <Image style={styles.search} source={require('./../image/icon/search.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '20%', marginLeft: 10, marginRight: 10 }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('chatlist')}>
                                    <Image style={styles.search} source={require('./../image/icon/logo.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', padding: 30, borderBottomColor: '#EAEAEA', borderBottomWidth: 1, borderTopColor: '#EAEAEA', borderTopWidth: 1, paddingBottom: 30, marginBottom: 25, marginTop: -50, backgroundColor: '#DDB937' }}>
                            <View style={{ width: '25%' }}>
                                <Image style={{ width: 70, height: 70, borderRadius: 500, marginTop: 13, borderWidth: 2, borderColor: '#ffffff' }} source={this.state.images.length ? { uri: this.state.images[0].url } : require('./../image/ad2.jpg')} />
                            </View>
                            <View style={{ width: '70%', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={"What's going on?"}
                                    placeholderTextColor={"#ffffff"}
                                    value={this.state.going}
                                    onChangeText={going => this.setState({ going })}
                                    multiline={true}
                                    onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}

                                />
                            </View>
                        </View>

                        {this.state.going || this.state.images.length > 0 ?

                            <GradientButton
                                style={{ marginVertical: 8., marginTop: -15, marginBottom: 20, alignSelf: 'center' }}
                                text={loading ? <ActivityIndicator color={"#fff"} size={"small"} /> : "Post Now"}
                                textStyle={{ fontSize: 17, fontWeight: '100' }}
                                gradientBegin="#DDB937"
                                gradientEnd="#DDB937"
                                gradientDirection="diagonal"
                                height={40}
                                width={'90%'}
                                radius={50}
                                impact
                                impactStyle='Light'
                                onPressAction={() => this.TextPost()}
                            />
                            :
                            null
                        }

                        <View style={{ flexDirection: 'row', marginBottom: 20 }}>

                            <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/mic.png')} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/music.png')} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                <Image style={{ width: 30, height: 20, alignSelf: 'center' }} source={require('./../image/icon/btnlive.png')} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                <Image style={{ width: 30, height: 20, alignSelf: 'center' }} source={require('./../image/icon/btnphoto.png')} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%' }}>
                                <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/btnactivity.png')} />
                            </TouchableOpacity>

                        </View>

                        <View style={{ backgroundColor: '#E0E0E0', padding: 5 }}></View>


                        <View style={{ backgroundColor: 'white', marginTop: 0, paddingTop: 20, paddingBottom: 20, flexDirection: 'row' }}>

                            <ScrollView showsHorizontalScrollIndicator={false} horizontal>

                                <TouchableOpacity style={{ alignSelf: 'center' }}>
                                    <Image style={{ width: 120, height: 50, alignSelf: 'center', marginRight: 20, marginLeft: 20 }} source={require('./../image/icon/btncreategroup.png')} />
                                </TouchableOpacity>

                                <FlatList
                                    pagingEnabled
                                    horizontal
                                    data={this.state.group}
                                    renderItem={this.renderGroup}
                                    keyExtractor={item => item.id}
                                />
                            </ScrollView>

                        </View>

                        <View style={{ backgroundColor: '#E0E0E0', padding: 5 }}></View>

                        <View style={{ backgroundColor: 'white', marginTop: 0, paddingTop: 20, paddingBottom: 20, flexDirection: 'row' }}>

                            <ScrollView showsHorizontalScrollIndicator={false} horizontal>

                                <TouchableOpacity style={{ alignSelf: 'center' }}>
                                    <Image style={{ width: 120, height: 50, alignSelf: 'center', marginRight: 20, marginLeft: 20 }} source={require('./../image/icon/btncreategroup2.png')} />
                                </TouchableOpacity>

                                <FlatList
                                    pagingEnabled
                                    horizontal
                                    data={this.state.group}
                                    renderItem={this.renderGroup}
                                    keyExtractor={item => item.id}
                                />
                            </ScrollView>

                        </View>

                        <View style={{ backgroundColor: '#E0E0E0', padding: 5 }}></View>

                        <View style={{ backgroundColor: 'white', marginTop: 0, paddingTop: 20, paddingBottom: 20, flexDirection: 'row' }}>

                            <ScrollView showsHorizontalScrollIndicator={false} horizontal>

                                <TouchableOpacity style={{ alignSelf: 'center', marginTop: -3 }}>
                                    <View style={styles.createStory}>
                                        <Image style={styles.imgStory} source={require('./../image/ad2.jpg')} />
                                        <Image style={{ width: 35, height: 35, borderWidth: 2, borderColor: '#ffffff', alignSelf: 'center', marginTop: -20, borderRadius: 250 }} source={require('./../image/icon/btnadd.png')} />
                                        <Text style={{ fontSize: 18, padding: 10, marginTop: -10, alignSelf: 'center' }}>Créer Wak's</Text>

                                    </View>
                                </TouchableOpacity>

                                <FlatList
                                    pagingEnabled
                                    horizontal
                                    data={this.state.story}
                                    renderItem={this.renderStory}
                                    keyExtractor={item => item.id}
                                />
                            </ScrollView>

                        </View>



                        <View style={{ backgroundColor: '#E0E0E0', padding: 5 }}></View>

                        <FlatList
                            data={this.state.posts}
                            renderItem={this.renderPosts}
                            keyExtractor={item => item.id}
                        />

                    </ScrollView>
                </View>
                <Loading
                    showMe={this.state.loadingImage}
                    onClose={this.onCloseLoading}
                />

                <Modal
                    transparent={true}
                    visible={this.state.editPost}
                    onRequestClose={() => this.setState({ editPost: false })}
                >
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ backgroundColor: '#fff', width: '100%', height: 350, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ alignItems: 'center', width: '100%' }}>
                                <Text style={{ fontSize: 24, color: '#000' }}>Edit Post</Text>
                            </View>
                            <View style={{ flexDirection: 'row', padding: 30, borderBottomColor: '#EAEAEA', borderBottomWidth: 1, borderTopColor: '#EAEAEA', borderTopWidth: 1, paddingBottom: 30, marginBottom: 25, marginTop: 20, backgroundColor: '#DDB937' }}>
                                <View style={{ width: '25%' }}>
                                    <Image style={{ width: 70, height: 70, borderRadius: 500, marginTop: 13, borderWidth: 2, borderColor: '#ffffff' }} source={this.state.imagesEdit.length ? { uri: this.state.imagesEdit[0].url } : require('./../image/ad2.jpg')} />
                                </View>
                                <View style={{ width: '70%', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={"What's going on?"}
                                        placeholderTextColor={"#ffffff"}
                                        value={this.state.goingEdit}
                                        onChangeText={goingEdit => this.setState({ goingEdit })}
                                        multiline={true}
                                        onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}

                                    />
                                </View>
                            </View>

                            {this.state.goingEdit || this.state.imagesEdit.length > 0 ?
                                <GradientButton
                                    style={{ marginVertical: 8., marginTop: -15, marginBottom: 20, alignSelf: 'center' }}
                                    text={loading ? <ActivityIndicator color={"#fff"} size={"small"} /> : "Edit Post"}
                                    textStyle={{ fontSize: 17, fontWeight: '100' }}
                                    gradientBegin="#DDB937"
                                    gradientEnd="#DDB937"
                                    gradientDirection="diagonal"
                                    height={40}
                                    width={'90%'}
                                    radius={50}
                                    impact
                                    impactStyle='Light'
                                    onPressAction={() => this.EditTextPost()}
                                />
                                :
                                null
                            }

                            <View style={{ flexDirection: 'row', marginBottom: 20 }}>

                                <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                    <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/mic.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                    <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/music.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                    <Image style={{ width: 30, height: 20, alignSelf: 'center' }} source={require('./../image/icon/btnlive.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%', borderRightColor: '#EAEAEA', borderRightWidth: 1 }}>
                                    <Image style={{ width: 30, height: 20, alignSelf: 'center' }} source={require('./../image/icon/btnphoto.png')} />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ showMe: true })} style={{ width: '20%' }}>
                                    <Image style={{ width: 25, height: 25, alignSelf: 'center' }} source={require('./../image/icon/btnactivity.png')} />
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>

                </Modal>
                <Modal
                    transparent={true}
                    visible={this.state.showMe}
                    onRequestClose={() => this.setState({ showMe: false })}
                >
                    <View style={{ flex: 1, }}>
                        <TouchableOpacity onPress={() => this.setState({ showMe: false })} style={{ backgroundColor: 'rgba(0,0,0,0.5)', height: '30%' }}></TouchableOpacity>
                        <View style={{ backgroundColor: '#fff', height: '70%' }}>
                            <View style={{ padding: 10 }}>

                                <TouchableOpacity onPress={() => this._uploadImage()} style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Photo/Videos</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Tag Friends</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Feelings/Activity</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Check In</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Background Color</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Camera</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Go Live</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Gif</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Music</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'row', borderBottomColor: '#EAEAEA', borderBottomWidth: 1, padding: 13, paddingLeft: 0 }}>
                                    <View style={{ width: '15%' }}>
                                        <Image style={{ width: 20, height: 20, alignSelf: 'center' }} source={require('./../image/icon/labelshare.png')} />
                                    </View>
                                    <View style={{ width: '50%' }}>
                                        <Text style={{ color: '#000', fontSize: 15 }}>Record a note</Text>
                                    </View>
                                </TouchableOpacity>



                            </View>
                        </View>
                    </View>
                </Modal>
                <ImageView
                    images={this.state.imagesFull}
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
        width: 150,
        height: 70,
        marginTop: -20
    },
    ads: {
        width: 60,
        height: 60,
        alignSelf: 'center',
        marginTop: wp('0%'),
        borderRadius: 250,
        marginRight: 5
    },
    story: {
        width: 130,
        height: 170,
        alignSelf: 'center',
        marginTop: wp('0%'),
        borderRadius: 20,
        marginRight: 10
    },
    img: {
        width: '100%',
        height: 180,
        alignSelf: 'center',
        marginTop: 0,
        borderRadius: 15,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0
    },
    imgStory: {
        width: 140,
        height: 120,
        alignSelf: 'center',
        marginTop: wp('0%'),
        borderRadius: 15,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0
    },
    search: {
        width: 50,
        height: 50,
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

    },
    createStory: {
        margin: 5,
        backgroundColor: 'white',
        borderColor: '#EAEAEA',
        borderWidth: 1,
        borderRadius: 20,
        marginRight: 10,
        marginLeft: 20

    },
    profile: {
        width: 50,
        height: 50,
        marginBottom: wp('10%')
    },
    dot: {
        width: 55,
        height: 35,
        marginTop: wp('3%'),
        marginLeft: -10
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
        width: 220,
        padding: 10,
        marginBottom: 0,
        backgroundColor: 'transparent',
        color: '#ffffff',
        fontSize: 22,
        marginTop: 25
    },
});