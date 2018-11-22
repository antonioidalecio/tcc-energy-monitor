package com.tcc.energymonitor.energymonitor.model;

public class DataChartFirebase {

    private Long timestamp;
    private Double potencia;

    public DataChartFirebase() {
    }

    public DataChartFirebase(Double potencia, Long timestamp) {
        this.timestamp = timestamp;
        this.potencia = potencia;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    public Double getPotencia() {
        return potencia;
    }

    public void setPotencia(Double potencia) {
        this.potencia = potencia;
    }
    
    @Override
    public String toString() {
        return "DataChartFirebase{" +
          "timestamp=" + timestamp +
          ", potencia=" + potencia +
          '}';
    }
}
