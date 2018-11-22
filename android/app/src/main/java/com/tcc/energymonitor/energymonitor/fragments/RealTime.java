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

import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.tcc.energymonitor.energymonitor.R;
import com.tcc.energymonitor.energymonitor.model.DataChartFirebase;
import com.tcc.energymonitor.energymonitor.model.UserOptions;

import java.sql.Date;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import lecho.lib.hellocharts.formatter.SimpleAxisValueFormatter;
import lecho.lib.hellocharts.formatter.SimpleLineChartValueFormatter;
import lecho.lib.hellocharts.model.Axis;
import lecho.lib.hellocharts.model.AxisValue;
import lecho.lib.hellocharts.model.Line;
import lecho.lib.hellocharts.model.LineChartData;
import lecho.lib.hellocharts.model.PointValue;
import lecho.lib.hellocharts.model.Viewport;
import lecho.lib.hellocharts.view.LineChartView;

/**
 * A simple {@link Fragment} subclass.
 */
public class RealTime extends Fragment {
  
  
  public RealTime() {
    // Required empty public constructor
  }
  
  ArrayList<DataChartFirebase> dataCharts = new ArrayList<>();
  private ProgressBar progressBar = null;
  Double potenciaAcumulada = 0.0;
  Float demandaMax = 0.0f;
  Long lastTimestamp;
  int count = -1;
  boolean flag = false;
  
  List<AxisValue> axisValues = new ArrayList<AxisValue>();
  Line line = new Line();
  
  private LineChartView chartTop;
  private LineChartData lineData;
  private UserOptions userOptions = null;
  private DatabaseReference userOptionsRef = null;
  
  private SimpleDateFormat mFormat = new SimpleDateFormat( "dd/MMM-HH:mm:ss", new Locale("pt", "BR"));
  
  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container,
                           Bundle savedInstanceState) {
    // Inflate the layout for this fragment
    
    // keep the fragment and all its data across screen rotation
    setRetainInstance(true);
    
    final View view = inflater.inflate(R.layout.fragment_real_time, container, false);
    progressBar = view.findViewById(R.id.progressBar);
    
    
    chartTop = view.findViewById(R.id.chart_top);
    DisplayMetrics displaymetrics = new DisplayMetrics();
    getActivity().getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    chartTop.setMinimumHeight((int) (displaymetrics.heightPixels * 0.65));
    chartTop.setMinimumWidth((displaymetrics.widthPixels));
    
    // Generate and set data for line chart
    generateInitialLineData();
    listenForUserOptionsUpdate();
    
    FirebaseDatabase database = FirebaseDatabase.getInstance();
    String currentDate = new SimpleDateFormat("yyyy/MM", new Locale("pt", "BR"))
      .format(System.currentTimeMillis());
    
    String path = String.format("acumulados/%s", currentDate);
    
    final DatabaseReference myRefAcumulado = database.getReference(path);
    
    myRefAcumulado.addListenerForSingleValueEvent(new ValueEventListener() {
      @Override
      public void onDataChange(@NonNull DataSnapshot dataSnapshot) {
        
        Log.e(RealTime.class.getName(), "Valor acumulado: " + dataSnapshot.child("acumulado").getValue().toString());
        
        potenciaAcumulada += (Double) dataSnapshot.child("acumulado").getValue();
        lastTimestamp = (Long) dataSnapshot.child("updatedBy").getValue();
        Log.e(RealTime.class.getName(), potenciaAcumulada + "");
        listenerFirebaseEvent();
      }
      
      @Override
      public void onCancelled(@NonNull DatabaseError databaseError) {
      
      }
    });
    
    return view;
  }
  
  private void generateInitialLineData() {
    
    int numValues = 7;
    
    List<AxisValue> axisValues = new ArrayList<AxisValue>();
    List<PointValue> values = new ArrayList<PointValue>();
    
    progressBar.setVisibility(View.VISIBLE);
    
    Line line = new Line(values);
    List<Line> lines = new ArrayList<Line>();
    lines.add(line);
    
    lineData = new LineChartData(lines);
    lineData.setAxisXBottom(new Axis(axisValues).setHasLines(true).setHasTiltedLabels(true));
    lineData.setAxisYLeft(new Axis().setHasLines(true).setMaxLabelChars(3));
    chartTop.setLineChartData(lineData);

//        chartTop.setZoomType(ZoomType.HORIZONTAL_AND_VERTICAL);
  }
  
  private void handleUserOptionsUpdate(UserOptions userOptions) {
    
    Log.e(RealTime.class.getName(), "handleUserOptionsUpdate - " + userOptions.toString());
    
    if (userOptions != null) {
      
      this.userOptions = userOptions;
      
      if (userOptions.metaMensal != null)
        demandaMax = userOptions.metaMensal.floatValue();
      
      Log.e(RealTime.class.getName(), "UserOptions recebidas: " + userOptions.toString());
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
          Log.e(RealTime.class.getName(), "Erro ao obter user options: " + databaseError.toString());
        }
        
      };
      
      userOptionsRef.addValueEventListener(userOptionsEventListener);
      
    }
    
  }
  
  private void listenerFirebaseEvent() {
    
    final FirebaseDatabase database = FirebaseDatabase.getInstance();
    final DatabaseReference myRef = database.getReference("/historico");
    
    myRef.orderByChild("timestamp").startAt(lastTimestamp).addChildEventListener(new ChildEventListener() {
      @Override
      public void onChildAdded(@NonNull DataSnapshot dataSnapshot, @Nullable String s) {
        // Log.e(RealTime.class.getName(), "Adicionado");
        
        Double potenciaMAX = 0.0;
        
        DataChartFirebase dataChartFirebase = dataSnapshot.getValue(DataChartFirebase.class);
        
        if (!dataChartFirebase.getTimestamp().equals(lastTimestamp)) {
          
          int numValues = 7;
          count++;
          Line lineDemand = null;
          if (demandaMax != null) {
            lineDemand = new Line();
            lineDemand.setColor(Color.RED);
            lineDemand.setHasLabels(true);
            lineDemand.getValues().add(new PointValue(0, demandaMax));
            lineDemand.getValues().add(new PointValue(7, demandaMax));
          }
          
          if (dataCharts.size() > numValues) {
            dataCharts.remove(0);
          }
          
          line.getValues().clear();
          axisValues.clear();
          
          Log.e(RealTime.class.getName(), dataChartFirebase.toString());
          Date d = new Date(dataChartFirebase.getTimestamp());
          DateFormat f = new SimpleDateFormat("HH");
          TimeZone gmtTimeZone = TimeZone.getTimeZone("GMT-4");
          TimeZone.setDefault(gmtTimeZone);
          f.setTimeZone(gmtTimeZone);
          potenciaAcumulada += dataChartFirebase.getPotencia();
          
          dataCharts.add(new DataChartFirebase(potenciaAcumulada, dataChartFirebase.getTimestamp()));
          
          Log.e(RealTime.class.getName(), dataCharts.size() + "");
          
          if (dataCharts.size() > 1) {
            chartTop.setViewportCalculationEnabled(true);
            progressBar.setVisibility(View.GONE);
          } else {
            return;
          }
          
          for (int i = 0; i < dataCharts.size(); ++i) {
            
            potenciaMAX = Math.max(potenciaMAX, dataCharts.get(i).getPotencia());
            
            if (userOptions.unidade.equals("R$")) {
              line.getValues().add(new PointValue(i, dataCharts.get(i).getPotencia().floatValue() * userOptions.tarifa.floatValue()));
              axisValues.add(new AxisValue(i).setLabel(mFormat.format(dataCharts.get(i).getTimestamp())));
            } else {
              line.getValues().add(new PointValue(i, dataCharts.get(i).getPotencia().floatValue()));
              axisValues.add(new AxisValue(i).setLabel(mFormat.format(dataCharts.get(i).getTimestamp())));
            }
          }
          
          if (demandaMax != null)
            potenciaMAX = Math.max(potenciaMAX, demandaMax);
          
          line.setColor(Color.rgb(0, 133, 119)).setCubic(true);
//                    line.setHasLabels(true);
          line.setCubic(true);
          line.setFilled(true);
          line.setHasPoints(true);
          line.setHasLabels(true);
          
          List<Line> lines = new ArrayList<Line>();
          lines.add(line);
          
          if (lineDemand != null)
            lines.add(lineDemand);
          
          lineData.setLines(lines);
          lineData.setAxisXBottom(new Axis(axisValues).setHasLines(true)
            .setHasTiltedLabels(true)
            .setMaxLabelChars(6)
            .setTextSize(9)
            .setName("     ")
            .setTextColor(Color.parseColor("#000000")));
          
          if (userOptions.unidade.equals("R$")) {
            lineData.setAxisYLeft(new Axis()
              .setHasLines(true)
              .setMaxLabelChars(10)
              .setTextSize(9)
              .setTextColor(Color.parseColor("#000000"))
              .setFormatter(new SimpleAxisValueFormatter()
                .setDecimalDigitsNumber(2)
                .setPrependedText("R$".toCharArray())));
            
            line.setFormatter(new SimpleLineChartValueFormatter()
              .setPrependedText("R$".toCharArray())
              .setDecimalDigitsNumber(2));
            
            if (lineDemand != null)
              lineDemand.setFormatter(new SimpleLineChartValueFormatter()
                .setPrependedText("R$".toCharArray())
                .setDecimalDigitsNumber(2));
            
            
          } else {
            lineData.setAxisYLeft(new Axis()
              .setHasLines(true)
              .setMaxLabelChars(10)
              .setTextSize(9)
              .setTextColor(Color.parseColor("#000000"))
              .setFormatter(new SimpleAxisValueFormatter()
                .setDecimalDigitsNumber(3)
                .setAppendedText("kWh".toCharArray())));
            
            line.setFormatter(new SimpleLineChartValueFormatter()
              .setDecimalDigitsNumber(3)
              .setAppendedText("kWh".toCharArray()));
            
            if (lineDemand != null)
              lineDemand.setFormatter(new SimpleLineChartValueFormatter()
                .setDecimalDigitsNumber(2)
                .setAppendedText("kWh".toCharArray()));
          }
          
          lineData.setAxisYRight(new Axis().setTextColor(Color.alpha(0))
            .setMaxLabelChars(3));
          
          chartTop.setLineChartData(lineData);
          Viewport v = new Viewport(0, potenciaMAX.floatValue() + 2f, 6, 0);
          chartTop.setCurrentViewport(v);
        }
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
}
