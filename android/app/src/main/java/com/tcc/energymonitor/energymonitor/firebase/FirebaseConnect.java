//package com.tcc.energymonitor.energymonitor.Firebase;
//
//import com.google.firebase.FirebaseApp;
//import com.google.firebase.database.DataSnapshot;
//import com.google.firebase.database.DatabaseError;
//import com.google.firebase.database.DatabaseReference;
//import com.google.firebase.database.FirebaseDatabase;
//import com.google.firebase.database.ValueEventListener;
//import com.tcc.energymonitor.energymonitor.model.DataChartFirebase;
//
//import java.util.ArrayList;
//import java.util.concurrent.CountDownLatch;
//import java.util.concurrent.atomic.AtomicBoolean;
//import java.util.concurrent.atomic.AtomicInteger;
//import java.util.concurrent.atomic.AtomicReference;
//
//public class FirebaseConnect {
//
//    private String value;
//
//    public interface OnGetDataListener {
//        //this is for callbacks
//        void onSuccess(DataSnapshot dataSnapshot);
//        void onStart();
//        void onFailure();
//    }
//
//    public FirebaseConnect() {
//
//    }
//
//    public getDataChart(final OnGetDataListener listener){
//        // Write a message to the database
//        listener.onStart();
//        FirebaseDatabase database = FirebaseDatabase.getInstance();
//        final DatabaseReference myRef = database.getReference("/historico");
//
//        // Read from the database
//        myRef.addValueEventListener(new ValueEventListener() {
//            @Override
//            public void onDataChange(DataSnapshot dataSnapshot) {
////                String path = dataSnapshot.getRef().toString();
////                System.out.println("Value Firebase1" + path);
////                //value = "Foda-se";
////
////                for (DataSnapshot data : dataSnapshot.getChildren()) {
////
////                    String time = data.child("timestamp").getValue().toString();
////                    double potencia = (double)data.child("potencia").getValue();
////
////                    //dataCharts.add(new DataChart(time, potencia));
////
////                    //FirebaseConnect.DataChart dataChart = new FirebaseConnect.DataChart(timesStamp, potencia);
////                    System.out.println("timeStamp1: " + time + " Potencia1: " + potencia);
////                    //System.out.println("timeStamp: " + dc.getTimestamp());
////                    //dataChart.add(dataChart);
////                }
//
//                listener.onSuccess(dataSnapshot);
//            }
//
//            @Override
//            public void onCancelled(DatabaseError error) {
//                System.out.println("Value Firebase" + error);
//                listener.onFailure();
//                //Log.w(Tag, "Failed to read value.", error.toException());
//            }
//
//        });
//    }
//
//    public String getValue() {
//        return value;
//    }
//
//    public void setValue(String value) {
//        this.value = value;
//    }
//
//}