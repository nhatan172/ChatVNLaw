var firebase = require('firebase');
var constant = require('../../components/constants');
var itemConvert = require('./message');

module.exports = {
    notifyMessagesComming :function(properties,callback){
        if(properties.rid){
            let ref = firebase.database().ref(`rooms/${properties.rid}/messages`).orderByChild('msg_ts').startAt(properties.ts);
            ref.on('child_added', function(snapshot){
                if(snapshot.exists()){
                    let item = itemConvert(snapshot,properties);
                    return callback('child_added', item, ref);
                }
            })
            ref.on('child_changed', function(snapshot){
                if(snapshot.exists()){
    
                }
            })
        }    
    },
    history: function(properties,limit, callback){
        if(properties.rid){
            let ref = firebase.database().ref(`rooms/${properties.rid}/messages`).orderByChild('msg_ts').endAt(properties.ts).limitToLast(limit);
            ref.once('value').then(function(data){
                if(data.exists()){
                    var messArr = []
                    let count = -1;
                    
                    data.forEach(function(element){
                        count ++;
                        let item  = itemConvert(element,properties);
                        return callback(item,count);
                    });
                }
            })
        }
    },
    chat: function(properties, callback){
        if(properties.rid){
            let ref = firebase.database().ref(`rooms/${properties.rid}/messages`);
            ref.push().set({
                "text": properties.content,
                "sender_uid": properties.uid,
                "msg_ts": properties.ts,
                "photoURL": properties.photoURL
            })
            return callback();
        }     
    }
}