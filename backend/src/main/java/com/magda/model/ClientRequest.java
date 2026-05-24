package com.magda.model;

import java.time.LocalDate;

public class ClientRequest {
    private String name;
    private int age;
    private String genre;
    private String evaluationType; // "PRESENCIAL" | "ONLINE"
    private LocalDate evaluationDate;

    // ── Presencial ───────────────────────────────────────────────────────────
    private double height;   // metros
    private double peso;
    private double fatMass;
    private double boneMass;
    private double water;
    private double muscleMass;
    private int physicalLevel;
    private double basalMetabolism;
    private double metabolicAge;
    private double visceralFat;

    // ── Online ───────────────────────────────────────────────────────────────
    private double heightCm;  // cm para fórmulas US Navy
    private double waist;
    private double neck;
    private double hip;
    private double chestPerimeter;
    private double armPerimeter;
    private double thighPerimeter;

    // ── Getters / Setters ────────────────────────────────────────────────────
    public String getName()                     { return name; }
    public void setName(String v)               { this.name = v; }
    public int getAge()                         { return age; }
    public void setAge(int v)                   { this.age = v; }
    public String getGenre()                    { return genre; }
    public void setGenre(String v)              { this.genre = v; }
    public String getEvaluationType()           { return evaluationType; }
    public void setEvaluationType(String v)     { this.evaluationType = v; }
    public LocalDate getEvaluationDate()        { return evaluationDate; }
    public void setEvaluationDate(LocalDate v)  { this.evaluationDate = v; }
    public double getHeight()                   { return height; }
    public void setHeight(double v)             { this.height = v; }
    public double getPeso()                     { return peso; }
    public void setPeso(double v)               { this.peso = v; }
    public double getFatMass()                  { return fatMass; }
    public void setFatMass(double v)            { this.fatMass = v; }
    public double getBoneMass()                 { return boneMass; }
    public void setBoneMass(double v)           { this.boneMass = v; }
    public double getWater()                    { return water; }
    public void setWater(double v)              { this.water = v; }
    public double getMuscleMass()               { return muscleMass; }
    public void setMuscleMass(double v)         { this.muscleMass = v; }
    public int getPhysicalLevel()               { return physicalLevel; }
    public void setPhysicalLevel(int v)         { this.physicalLevel = v; }
    public double getBasalMetabolism()          { return basalMetabolism; }
    public void setBasalMetabolism(double v)    { this.basalMetabolism = v; }
    public double getMetabolicAge()             { return metabolicAge; }
    public void setMetabolicAge(double v)       { this.metabolicAge = v; }
    public double getVisceralFat()              { return visceralFat; }
    public void setVisceralFat(double v)        { this.visceralFat = v; }
    public double getHeightCm()                 { return heightCm; }
    public void setHeightCm(double v)           { this.heightCm = v; }
    public double getWaist()                    { return waist; }
    public void setWaist(double v)              { this.waist = v; }
    public double getNeck()                     { return neck; }
    public void setNeck(double v)               { this.neck = v; }
    public double getHip()                      { return hip; }
    public void setHip(double v)                { this.hip = v; }
    public double getChestPerimeter()           { return chestPerimeter; }
    public void setChestPerimeter(double v)     { this.chestPerimeter = v; }
    public double getArmPerimeter()             { return armPerimeter; }
    public void setArmPerimeter(double v)       { this.armPerimeter = v; }
    public double getThighPerimeter()           { return thighPerimeter; }
    public void setThighPerimeter(double v)     { this.thighPerimeter = v; }

    public double getIMC() {
        if (height > 0 && peso > 0) return peso / (height * height);
        if (heightCm > 0 && peso > 0) return peso / Math.pow(heightCm / 100.0, 2);
        return 0;
    }
}