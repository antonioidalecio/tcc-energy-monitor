package com.tcc.energymonitor.energymonitor.fragments;


import android.graphics.Color;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;

import com.github.mikephil.charting.charts.PieChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import com.github.mikephil.charting.formatter.IValueFormatter;
import com.github.mikephil.charting.utils.ViewPortHandler;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.tcc.energymonitor.energymonitor.R;
import com.tcc.energymonitor.energymonitor.model.UserOptions;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

/**
 * A simple {@link Fragment} subclass.
 */
public class Weekly extends Fragment {


  public Weekly() {
    // Required empty public constructor
  }

  private PieChart pieChart;
  ArrayList<PieEntry> pieEntries = new ArrayList<>();
  Long lastTimestamp;
  HashMap<String, Double> weekPower = new HashMap<>();
  private ProgressBar progressBar = null;
  private UserOptions userOptions = null;
  private DatabaseReference userOptionsRef = null;

  @Override
  public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {

    View view = inflater.inflate(R.layout.fragment_weekly, container, false);
    pieChart = view.findViewById(R.id.pieChart);
    progressBar = view.findViewById(R.id.progressBar);

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    String currentDate = new SimpleDateFormat("yyyy/MM", new Locale("pt", "BR"))
            .format(System.currentTimeMillis());

    renderChartPie();
    listenForUserOptionsUpdate();

    String path = String.format("acumulados/%s", currentDate);
    Log.e("Path: ", path);

    final DatabaseReference myRefAcumulado = database.getReference(path);

    myRefAcumulado.addListenerForSingleValueEvent(new ValueEventListener() {
      @Override
      public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

        Log.e("DataSnashot: ", dataSnapshot.getValue().toString());
        for (DataSnapshot data : dataSnapshot.getChildren()) {
          Log.e("Child: ", data.getValue().toString());

          if(data.child("updatedBy").getValue() == null){
            continue;
          }

          String currentDate = new SimpleDateFormat("EEE", new Locale("pt", "BR"))
                  .format(data.child("updatedBy").getValue());

          Log.e("CurrentDateOnData: ", currentDate);

          if (weekPower.get(currentDate) == null) {
            weekPower.put(currentDate, (Double) data.child("acumulado").getValue());
          } else {
            weekPower.put(currentDate, ((Double) data.child("acumulado").getValue() + weekPower.get(currentDate)));
          }

          lastTimestamp = (Long) data.child("updatedBy").getValue();
        }

        listenerFirebaseEvent();
        Log.e("WeekPower: ", weekPower.toString());
      }

      @Override
      public void onCancelled(@NonNull DatabaseError databaseError) {

      }
    });

    return view;
  }

  private void handleUserOptionsUpdate(UserOptions userOptions) {

    Log.e("Use: ", userOptions.toString());
    if (userOptions != null) {

      this.userOptions = userOptions;
      Log.e(HomePage.class.getName(), "UserOptions recebidas: " + userOptions.toString());
      
    }

  }

  private void listenForUserOptionsUpdate() {

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    ValueEventListener userOptionsEventListener = null;

    if (userOptionsRef == null) {
      userOptionsRef = database.getReference("userOptions");
    }

    if (userOptionsEventListener == null) {

      userOptionsEventListener = new ValueEventListener() {

        @Override
        public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

          UserOptions userOptions = dataSnapshot.getValue(UserOptions.class);

          handleUserOptionsUpdate(userOptions);
        }

        @Override
        public void onCancelled(@NonNull DatabaseError databaseError) {
          Log.e(HomePage.class.getName(), "Erro ao obter user options: " + databaseError.toString());
        }

      };

      userOptionsRef.addValueEventListener(userOptionsEventListener);

    }

  }

  private void listenerFirebaseEvent() {

    FirebaseDatabase database = FirebaseDatabase.getInstance();
    final DatabaseReference myRef = database.getReference("/historico");

    Log.e("LastTimestamp: ", lastTimestamp.toString());
    myRef.orderByChild("timestamp").startAt(lastTimestamp).addChildEventListener(new ChildEventListener() {
      @Override
      public void onChildAdded(@NonNull DataSnapshot dataSnapshot, @Nullable String s) {

        Log.e("Add: ", dataSnapshot.getValue().toString());

        String currentDate = new SimpleDateFormat("EEE", new Locale("pt", "BR"))
                .format(dataSnapshot.child("timestamp").getValue());

        pieChart.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.INVISIBLE);

        Log.e("CurrentListener: ", currentDate);

        if (weekPower.get(currentDate) == null) {
          weekPower.put(currentDate, (Double) dataSnapshot.child("potencia").getValue());
        } else {
          weekPower.put(currentDate, ((Double) dataSnapshot.child("potencia").getValue() + weekPower.get(currentDate)));
        }

        pieEntries.clear();

        for (String key : weekPower.keySet()) {
          if (userOptions.unidade.equals("R$") || userOptions == null) {
            pieEntries.add(new PieEntry(weekPower.get(key).floatValue() * userOptions.tarifa.floatValue(), key));
          } else {
            pieEntries.add(new PieEntry(weekPower.get(key).floatValue(), key));
          }
        }

        pieChart.notifyDataSetChanged();
        pieChart.invalidate();
      }

      @Override
      public void onChildChanged(@NonNull DataSnapshot dataSnapshot, @Nullable String s) {

      }

      @Override
      public void onChildRemoved(@NonNull DataSnapshot dataSnapshot) {

      }

      @Override
      public void onChildMoved(@NonNull DataSnapshot dataSnapshot, @Nullable String s) {

      }

      @Override
      public void onCancelled(@NonNull DatabaseError databaseError) {

      }
    });
  }

  private void renderChartPie() {

    DisplayMetrics displaymetrics = new DisplayMetrics();
    getActivity().getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    pieChart.setMinimumHeight((int) (displaymetrics.heightPixels * 0.45));
    pieChart.setMinimumWidth((int) (displaymetrics.widthPixels * 0.65));

    ArrayList<Integer> colors = new ArrayList<>();
    colors.add(Color.rgb(0, 133, 119));
    colors.add(Color.parseColor("#2980b9"));
    colors.add(Color.parseColor("#e67e22"));
    colors.add(Color.parseColor("#f1c40f"));
    colors.add(Color.parseColor("#9b59b6"));
    colors.add(Color.parseColor("#009688"));
    colors.add(Color.parseColor("#CDDC39"));

//    pieEntries.add(new PieEntry(70, "seg"));
//    pieEntries.add(new PieEntry(60, "ter"));
    
    PieDataSet dataSet = new PieDataSet(pieEntries, null);
    
    // Alinha a legenda no centro da tela
    pieChart.getLegend().setHorizontalAlignment(Legend.LegendHorizontalAlignment.CENTER);
    
    PieData pieData = new PieData(dataSet);
    dataSet.setColors(colors);
    dataSet.setValueTextSize(12);
    dataSet.setValueTextColor(Color.WHITE);
    dataSet.setValueFormatter(new IValueFormatter() {
      @Override
      public String getFormattedValue(float value, Entry entry, int dataSetIndex, ViewPortHandler viewPortHandler) {
        if (userOptions.unidade.equals("R$")) {
          return String.format(Locale.ENGLISH, "R$%.2f", value);
        } else {
          return String.format(Locale.ENGLISH, "%.2fkWh", value);
        }
      }
    });
    pieChart.getDescription().setEnabled(false);
    pieChart.setData(pieData);
    pieChart.invalidate();
  }
}
