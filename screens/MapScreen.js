import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addPlace, addAllPlace } from "../reducers/user";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [tempCoordinates, setTempCoordinates] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlace, setNewPlace] = useState("");
  const [userPlaces, setUserPlaces] = useState([]);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        Location.watchPositionAsync({ distanceInterval: 10 }, (location) => {
          setCurrentPosition(location.coords);
        });
      }
    })();
  }, []);
console.log(user.nickname)
  useEffect(() => {
    
    fetch(`http://192.168.10.123:3000/places/${user.nickname}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(addAllPlace(data.places));
          setUserPlaces(data.places)
        }
      });
  }, []);

  const handleLongPress = (e) => {
    setTempCoordinates(e.nativeEvent.coordinate);
    setModalVisible(true);
  };

  const handleNewPlace = () => {
    fetch("http://192.168.10.123:3000/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newPlace,
        nickname: user.nickname,
        latitude: tempCoordinates.latitude,
        longitude: tempCoordinates.longitude,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            addPlace({
              name: newPlace,
              latitude: tempCoordinates.latitude,
              longitude: tempCoordinates.longitude,
            })
          );
          setModalVisible(false);
          setNewPlace("");
        }
      });
  };

  const handleClose = () => {
    setModalVisible(false);
    setNewPlace("");
  };
  console.log(userPlaces)


 

      let markers = userPlaces.map((place, i) => {
          return (
            <Marker
              key={i}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={place.name}
            />
          );
        });
      

  console.log('marker: ',markers);

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} animationType='fade' transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              placeholder='New place'
              onChangeText={(value) => setNewPlace(value)}
              value={newPlace}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => handleNewPlace()}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.textButton}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleClose()}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.textButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MapView
        onLongPress={(e) => handleLongPress(e)}
        mapType='hybrid'
        style={styles.map}
      >
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title='My position'
            pinColor='#fecb2d'
          />
        )}
        {markers}
        <Polyline
        coordinates={[
          { latitude: 37.78825, longitude: -122.4324 },
          { latitude: 37.75825, longitude: -122.4624 },
        ]}
        strokeWidth={3}
        strokeColor="#f00"
      />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: 150,
    borderBottomColor: "#ec6e5b",
    borderBottomWidth: 1,
    fontSize: 16,
  },
  button: {
    width: 150,
    alignItems: "center",
    marginTop: 20,
    paddingTop: 8,
    backgroundColor: "#ec6e5b",
    borderRadius: 10,
  },
  textButton: {
    color: "#ffffff",
    height: 24,
    fontWeight: "600",
    fontSize: 15,
  },
});
