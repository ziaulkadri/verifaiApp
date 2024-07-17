import { useRoute } from '@react-navigation/native';
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';

// const imageData = {
//     "Front": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
//     "Right Head Light": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
//     // Add more images here
// };
console.log("hey")
const numColumns = 2;
const imageSize = Dimensions.get('window').width / numColumns - 20;

const ImageGridScreen = () => {
    const route = useRoute();
    const imageData = route.params
    const imagesArray = imageData.data.scanned_images.flatMap(imageObject =>
        Object.entries(imageObject).map(([name, uri]) => ({ name, uri }))
    );
    //console.log("key",imagesArray);
    //console.log(imageData.data.scanned_images[2].name);
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri:'data:image/png;base64,' + item.uri }}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.imageName}>{item.name}</Text>
        </View>
    );

    return (
        <FlatList
            data={imagesArray}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 1,
    },
    itemContainer: {
        flex: 1,
       // margin: 1,
        alignItems: 'center',
    },
    image: {
        width: imageSize,
        height: imageSize,
        borderRadius: 10,
        padding: 2,
    },
    imageName: {
        //marginTop: 1,
        textAlign: 'center',
        color: 'black',
    },
});

export default ImageGridScreen;