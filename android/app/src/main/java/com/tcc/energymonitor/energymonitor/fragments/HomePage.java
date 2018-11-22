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
import android.widget.TextView;

import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.components.AxisBase;
import com.github.mikephil.charting.components.LimitLine;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.formatter.IAxisValueFormatter;
import com.github.mikephil.charting.formatter.IValueFormatter;
import com.github.mikephil.charting.utils.ViewPortHandler;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.tcc.energymonitor.energymonitor.R;
import com.tcc.energymonitor.energymonitor.model.DataChartFirebase;
import com.tcc.energymonitor.energymonitor.model.UserOptions;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import az.plainpie.PieView;
import az.plainpie.animation.PieAngleAnimation;

/**
 * A simple {@link Fragment} subclass.
 */
public class HomePage extends Fragment {

  public HomePage() {

    // Required empty public constructor
    Log.e(HomePage.class.getName(), "Construtor");

    database = FirebaseDatabase.getInstance();

  }

  private FirebaseDatabase database = null;

  private ArrayList<BarEntry> barEntries = new ArrayList<>();

  private BarChart barChart;
  private PieView pieView = null;
  private TextView consumoAtual;

  private ProgressBar progressBar = null;

  private UserOptions userOptions = null;

  private double consumo = 0.0;
  private double mesConsumo = 0.0;

  private DatabaseReference historicoRef = null;
  private DatabaseReference userOptionsRef = null;
  private DatabaseReference acumuladosRef = null;
  private DatabaseReference mesAcumuladoRef = null;

  private ValueEventListener mesAcumuladoChildEventListener = null;
  private ChildEventListener historicoChildEventListener = null;
  private ValueEventListener userOptionsEventListener = null;
  private ValueEventListener acumuladosEventListener = null;

  private float[] consumoPorHora = new float[24];
  private Float demandaMax = 0.0f;

  public void listenForHistoricoUpdates(Long startAtObject) {

    final long startAt;

    if (startAtObject != null) {
      startAt = startAtObject;
    } else {
      startAt = System.currentTimeMillis();
    }

    if (historicoChildEventListener == null) {

      historicoChildEventListener = new ChildEventListener() {

        @Override
        public void onChildAdded(@NonNull DataSnapshot dataSnapshot, @Nullable String s) {

          DataChartFirebase dataChartFirebase = dataSnapshot.getValue(DataChartFirebase.class);

          long timestamp = dataChartFirebase.getTimestamp();
          double potencia = dataChartFirebase.getPotencia();

          if (startAt == timestamp) {
            return;
          }

          Calendar calendar = Calendar.getInstance();
          calendar.setTime(new Date(timestamp));

          int hora = calendar.get(Calendar.HOUR_OF_DAY);

          consumoPorHora[hora] += Double.valueOf(potencia).floatValue();
          consumo += potencia;
          mesConsumo += potencia;

          updatePieView();
          updateBarChart();

          Log.e(HomePage.class.getName(),
            "historico - key: " + dataSnapshot.getKey() +
              ", timestamp: " + timestamp +
              ", data: " + (new SimpleDateFormat("dd/MM/yyyy HH:mm", new Locale("pt", "BR")).format(timestamp)));

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

      };

      if (historicoRef == null) {
        historicoRef = database.getReference("historico");
      }

      historicoRef
        .orderByChild("timestamp")
        .startAt(startAt)
        .addChildEventListener(historicoChildEventListener);

    }

  }

  private void updateBarChart() {

    barEntries.clear();

    float maximum = 0.0f;

    if (userOptions != null) {

      Double tarifa = userOptions.tarifa != null ? userOptions.tarifa : 0.0;
      String unidade = userOptions.unidade != null ? userOptions.unidade : "R$";

      for (int i = 0; i < consumoPorHora.length; i++) {

        float value = consumoPorHora[i];

        if (unidade.equals("R$")) {
          value = value * tarifa.floatValue();
        }

        maximum = Math.max(maximum, value);

        barEntries.add(new BarEntry(i, value));

      }

      YAxis yAxis = barChart.getAxisLeft();
      yAxis.setDrawLimitLinesBehindData(false);

      List<LimitLine> limitLines = yAxis.getLimitLines();

      for(LimitLine limitLine : limitLines) {
        yAxis.removeLimitLine(limitLine);
      }

      LimitLine limitLine = null;

      if(demandaMax != null) {
        limitLine = new LimitLine(demandaMax, "Demanda Max");
        limitLine.setLineWidth(3f);
        limitLine.enableDashedLine(10f, 5f, 0f);
        limitLine.setLabelPosition(LimitLine.LimitLabelPosition.RIGHT_TOP);
        limitLine.setTextSize(10f);
      }

      if(limitLine != null)
        yAxis.addLimitLine(limitLine);

      barChart.notifyDataSetChanged();
      barChart.invalidate();

    }

  }

  private void handleUserOptionsUpdate(UserOptions userOptions) {

    if (userOptions != null) {

      this.userOptions = userOptions;

      if(userOptions.metaMensal != null)
        demandaMax = userOptions.metaMensal.floatValue() / 30 / 24;
      else
        demandaMax = null;

      Log.e(HomePage.class.getName(), "UserOptions recebidas: " + userOptions.toString());

      updatePieView();
      updateBarChart();

    }

  }

  private void setConsumoInicial(Double consumo) {

    Log.e(HomePage.class.getName(), "consumo inicial: " + consumo);

    if (consumo != null) {
      this.consumo = consumo;
    }

  }

  private void listenForUserOptionsUpdate() {

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

  private void updateConsumoInicial() {

    if (acumuladosRef == null) {

      String currentDate = new SimpleDateFormat("yyyy/MM/dd", new Locale("pt", "BR"))
        .format(System.currentTimeMillis());

      String path = String.format("acumulados/%s", currentDate);

      Log.e(HomePage.class.getName(), "path: " + path);

      acumuladosRef = database.getReference(path);

    }

    if (acumuladosEventListener == null) {

      acumuladosEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

          Double consumoAcumulado = dataSnapshot.child("acumulado").getValue(Double.class);
          Long startAt = dataSnapshot.child("updatedBy").getValue(Long.class);

          for (int i = 0; i < consumoPorHora.length; i++) {

            String hora = String.format(new Locale("pt", "BR"), "%02d/acumulado", i);

            Double consumo = dataSnapshot.child(hora).getValue(Double.class);

            if (consumo != null) {
              consumoPorHora[i] = consumo.floatValue();
            } else {
              consumoPorHora[i] = 0.0f;
            }

            Log.e(HomePage.class.getName(), "consumo: " + consumo);

          }

          setConsumoInicial(consumoAcumulado);

          if (startAt != null)
            listenForHistoricoUpdates(startAt);

          updatePieView();
          updateBarChart();

        }

        @Override
        public void onCancelled(@NonNull DatabaseError databaseError) {
        }

      };

      acumuladosRef.addListenerForSingleValueEvent(acumuladosEventListener);

    }

  }

  private void updateConsumoMesInicial() {

    if (mesAcumuladoRef == null) {

      String currentDate = new SimpleDateFormat("yyyy/MM", new Locale("pt", "BR"))
              .format(System.currentTimeMillis());

      String path = String.format("acumulados/%s", currentDate);

      Log.e(HomePage.class.getName(), "path: " + path);

      mesAcumuladoRef = database.getReference(path);

    }

    if (mesAcumuladoChildEventListener == null) {

      mesAcumuladoChildEventListener = new ValueEventListener() {
        @Override
        public void onDataChange(@NonNull DataSnapshot dataSnapshot) {

          Double consumoAcumulado = dataSnapshot.child("acumulado").getValue(Double.class);
          Long startAt = dataSnapshot.child("updatedBy").getValue(Long.class);

          mesConsumo = consumoAcumulado.doubleValue();

          if (startAt != null)
            listenForHistoricoUpdates(startAt);

          updatePieView();
        }

        @Override
        public void onCancelled(@NonNull DatabaseError databaseError) {
        }
      };

      mesAcumuladoRef.addListenerForSingleValueEvent(mesAcumuladoChildEventListener);
    }
  }

  @Override
  public void onStart() {

    super.onStart();

    Log.e(HomePage.class.getName(), "onStart");

    listenForUserOptionsUpdate();

    updateConsumoInicial();
    updateConsumoMesInicial();
    
  }

  private void updatePieView() {

    Log.e(HomePage.class.getName(), "Renderizando PieView");

    // Caso o valor da tarifa já tenha sido recuperado do banco de dados então é mostrado
    // o PieView com a porcentagem de consumo
    if (userOptions != null) {

      progressBar.setVisibility(View.GONE);
      pieView.setAlpha(1.0f);

      Double metaMensal = userOptions.metaMensal;
      String unidade = userOptions.unidade;
      Double tarifa = userOptions.tarifa;

      Log.e(HomePage.class.getName(), "updatePieView - userOptions: " + userOptions.toString());

      if (metaMensal != null) {

        Double porcentagem = 0.0;

        switch (unidade) {
          case "kWh":

            porcentagem = 100 * mesConsumo / metaMensal;
            consumoAtual.setText(String.format(Locale.ENGLISH, "%.3fkWh", mesConsumo));

            Log.e(HomePage.class.getName(), "Porcentagem: " + porcentagem);

            pieView.setPercentage(porcentagem.floatValue());
            pieView.setInnerText(String.format(Locale.ENGLISH, "%.2f%%", porcentagem));

            PieAngleAnimation firstAnimation = new PieAngleAnimation(pieView);
            firstAnimation.setDuration(1000);
            pieView.setAnimation(firstAnimation);

            pieView.invalidate();

            break;

          case "R$":

            porcentagem = 100 * mesConsumo * tarifa / metaMensal;
            consumoAtual.setText(String.format(Locale.ENGLISH, "R$%.2f", mesConsumo * tarifa));

            Log.e(HomePage.class.getName(), "Porcentagem: " + porcentagem);

            pieView.setPercentage(porcentagem.floatValue());
            pieView.setInnerText(String.format(Locale.ENGLISH, "%.2f%%", porcentagem));

            PieAngleAnimation secondAnimation = new PieAngleAnimation(pieView);
            secondAnimation.setDuration(1000);
            pieView.setAnimation(secondAnimation);

            pieView.invalidate();

            break;
        }

      }

    }

  }

  @Override
  public void onStop() {

    Log.e(HomePage.class.getName(), "onStop");

    super.onStop();

    if (userOptionsRef != null) {
      if (userOptionsEventListener != null) {
        userOptionsRef.removeEventListener(userOptionsEventListener);
        userOptionsRef = null;
        userOptionsEventListener = null;
      }
    }

    if (historicoRef != null) {
      if (historicoChildEventListener != null) {
        historicoRef.removeEventListener(historicoChildEventListener);
        historicoRef = null;
        historicoChildEventListener = null;
      }
    }

    if (acumuladosRef != null) {
      if (acumuladosEventListener != null) {
        acumuladosRef.removeEventListener(acumuladosEventListener);
        acumuladosRef = null;
        acumuladosEventListener = null;
      }
    }

  }

  @Override
  public View onCreateView(@NonNull LayoutInflater inflater, final ViewGroup container, Bundle savedInstanceState) {

    // Inflate the layout for this fragment
    View view = inflater.inflate(R.layout.fragment_home_page, container, false);

    Log.e(HomePage.class.getName(), "onCreateView");

    // keep the fragment and all its data across screen rotation
    setRetainInstance(true);

    pieView = view.findViewById(R.id.pieView);
    pieView.setPercentageBackgroundColor(Color.rgb(0, 133, 119));
    consumoAtual = view.findViewById(R.id.consumo);
    progressBar = view.findViewById(R.id.progressBar);
    progressBar.setVisibility(View.VISIBLE);

    renderBarChart(view);

    return view;

  }

  public void renderBarChart(View view) {

    barChart = view.findViewById(R.id.barChart);

    XAxis barChartXAxis = barChart.getXAxis();
    barChartXAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
    barChartXAxis.setTextSize(10f);
    barChartXAxis.setLabelRotationAngle(270);
    barChartXAxis.setTextColor(Color.BLACK);
    barChartXAxis.setDrawAxisLine(true);
    barChartXAxis.setDrawGridLines(true);
    barChartXAxis.setLabelCount(24);
    barChartXAxis.setAxisMaximum(23);
    barChartXAxis.setAxisMinimum(0);
    barChartXAxis.setValueFormatter(new IAxisValueFormatter() {
      @Override
      public String getFormattedValue(float value, AxisBase axis) {

        int hora = (int) value;

        return String.format(Locale.ENGLISH, "%02d:00h", hora);

      }
    });

    YAxis barChartYAxis = barChart.getAxisLeft();
    barChartYAxis.setAxisMinimum(0f);
    barChartYAxis.setTextColor(Color.BLACK);
    barChartYAxis.setValueFormatter(new IAxisValueFormatter() {
      @Override
      public String getFormattedValue(float value, AxisBase axis) {

        String valueAsString = "";

        if (userOptions != null) {

          if (userOptions.unidade != null) {

            switch (userOptions.unidade) {

              case "kWh":
                valueAsString = String.format(Locale.ENGLISH, "%.2f kWh", value);
                break;

              case "R$":
                valueAsString = String.format(Locale.ENGLISH, "R$%.2f", value);

            }

          }

        }

        return valueAsString;
      }
    });

    YAxis rightBarY = barChart.getAxisRight();
    rightBarY.setEnabled(false);

    barEntries.add(new BarEntry(0, 0));

    BarDataSet barDataSet = new BarDataSet(barEntries, "Label"); // add entries to dataset
    barDataSet.setColor(Color.rgb(0, 133, 119), 255);
    barDataSet.setLabel("Consumo");
    barDataSet.setValueFormatter(new IValueFormatter() {
      @Override
      public String getFormattedValue(float value, Entry entry, int dataSetIndex, ViewPortHandler viewPortHandler) {

        String valueAsString = "";

        if (userOptions != null && value > 0.0f) {

          if (userOptions.unidade != null) {

            switch (userOptions.unidade) {

              case "kWh":
                valueAsString = String.format(Locale.ENGLISH, "%.2f kWh", value);
                break;

              case "R$":
                valueAsString = String.format(Locale.ENGLISH, "R$%.2f", value);

            }

          }

        }

        return valueAsString;

      }
    });

    barChart.setDescription(null);

    BarData barData = new BarData(barDataSet);
    barData.setValueTextSize(8);

    DisplayMetrics displaymetrics = new DisplayMetrics();
    getActivity().getWindowManager().getDefaultDisplay().getMetrics(displaymetrics);
    barChart.setMinimumHeight((int) (displaymetrics.heightPixels * 0.65));
    barChart.setMinimumWidth((int) (displaymetrics.widthPixels));
    barChart.setData(barData);
    barChart.invalidate(); // refresh
    barChart.animateY(2000);
    barChart.animateX(2000);
  }

}
