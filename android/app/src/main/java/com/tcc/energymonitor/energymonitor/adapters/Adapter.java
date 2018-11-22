package com.tcc.energymonitor.energymonitor.adapters;

import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.charts.Chart;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.tcc.energymonitor.energymonitor.R;

import java.util.ArrayList;

public class Adapter extends RecyclerView.Adapter<Adapter.MyViewHolder> {



    @NonNull
    @Override
    public MyViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {

        BarChart char1 = new BarChart(parent.getContext());

        RelativeLayout rl =  (RelativeLayout) LayoutInflater.from(parent.getContext()).
                inflate(R.layout.adapter_chart, parent, false);

        rl.addView(char1);

        return new MyViewHolder(rl);
    }

    @Override
    public void onBindViewHolder(@NonNull MyViewHolder holder, int position) {

        float[] dataObjects = {1.0f,2.0f,5.0f , 5.9f, 6.9f,7.9f};

        ArrayList<BarEntry> entries = new ArrayList<BarEntry>();

        for (float data : dataObjects) {

            // turn your data into Entry objects
            entries.add(new BarEntry(data, data));
        }

        BarDataSet dataSet = new BarDataSet(entries, "Label"); // add entries to dataset

        BarData barData = new BarData(dataSet);
//        chart.setData(barData);
        holder.chart.setData(barData);
        holder.chart.invalidate(); // refresh
//
//        holder.titulo.setText("Titulo");
//        holder.datal.setText("Autor");
//        holder.ano.setText("2017");
    }

    @Override
    public int getItemCount() {
        return 3;
    }

    public class  MyViewHolder extends RecyclerView.ViewHolder {

        Chart chart;

        public MyViewHolder(View itemView){
            super(itemView);

            //chart = itemView.findViewById(R.id.chart);
        }
    }

}
